-- Migration: RLS Updates for Soft Delete
-- Description: Updates RLS policies to exclude deleted records by default.
-- Author: Antigravity
-- Date: 2026-02-15

-- DROP existing generic policies to replace them with Soft Delete aware ones
-- Note: In a real production migration, we would be more careful about names.
-- Assuming standard names from schema.

-- Projects
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
CREATE POLICY "Authenticated users can view active projects" ON public.projects 
FOR SELECT USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

-- Spools
DROP POLICY IF EXISTS "Authenticated users can view spools" ON public.spools;
CREATE POLICY "Authenticated users can view active spools" ON public.spools 
FOR SELECT USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

-- Work Orders
DROP POLICY IF EXISTS "Authenticated users can view work orders" ON public.work_orders;
CREATE POLICY "Authenticated users can view active work orders" ON public.work_orders 
FOR SELECT USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

-- Inventory
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;
CREATE POLICY "Authenticated users can view active inventory" ON public.inventory 
FOR SELECT USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

-- Shipments
DROP POLICY IF EXISTS "Authenticated users can view shipments" ON public.shipments;
CREATE POLICY "Authenticated users can view active shipments" ON public.shipments 
FOR SELECT USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

-- Admin Override Policies (View Deleted)
CREATE POLICY "Admins can view all projects (including deleted)" ON public.projects 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND position = 'admin')
);

CREATE POLICY "Admins can view all spools (including deleted)" ON public.spools 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND position = 'admin')
);

CREATE POLICY "Admins can view all work_orders (including deleted)" ON public.work_orders 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND position = 'admin')
);
