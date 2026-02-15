-- Migration: Audit Logging & Auto User Tracking
-- Description: Centralized audit logs and triggers for created_by/updated_by.
-- Author: Antigravity
-- Date: 2026-02-15

-- 1. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES public.profiles(id),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only Admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND position = 'admin'
    )
);

-- 2. Function to set created_by and updated_by automatically
CREATE OR REPLACE FUNCTION public.set_tracking_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Set created_by on INSERT if not provided
    IF (TG_OP = 'INSERT') THEN
        IF NEW.created_by IS NULL THEN
            NEW.created_by := auth.uid();
        END IF;
        IF NEW.updated_by IS NULL THEN
            NEW.updated_by := auth.uid();
        END IF;
    -- Set updated_by on UPDATE
    ELSIF (TG_OP = 'UPDATE') THEN
        NEW.updated_by := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to insert into audit_logs
CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    old_val JSONB;
    new_val JSONB;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        old_val = to_jsonb(OLD);
        new_val = null;
    ELSIF (TG_OP = 'UPDATE') THEN
        old_val = to_jsonb(OLD);
        new_val = to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        old_val = null;
        new_val = to_jsonb(NEW);
    END IF;

    -- Avoid logging if no real change (for UPDATE)
    IF (TG_OP = 'UPDATE' AND old_val = new_val) THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.audit_logs (table_name, record_id, operation, old_data, new_data, changed_by)
    VALUES (
        TG_TABLE_NAME::TEXT,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        old_val,
        new_val,
        auth.uid()
    );
    return NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Apply Triggers to Core Tables
-- Tables: projects, spools, work_orders, inventory, profiles, shipments, material_requests, quality_checks, equipment

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY['projects', 'spools', 'work_orders', 'inventory', 'profiles', 'shipments', 'material_requests', 'quality_checks', 'equipment'])
    LOOP
        -- Apply Tracking Trigger
        EXECUTE format('DROP TRIGGER IF EXISTS set_tracking_columns_trigger ON public.%I', t);
        EXECUTE format('CREATE TRIGGER set_tracking_columns_trigger BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_tracking_columns()', t);
        
        -- Apply Audit Log Trigger
        EXECUTE format('DROP TRIGGER IF EXISTS process_audit_log_trigger ON public.%I', t);
        EXECUTE format('CREATE TRIGGER process_audit_log_trigger AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.process_audit_log()', t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;
