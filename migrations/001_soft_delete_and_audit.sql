-- Migration: Add Soft Delete and Audit Columns
-- Description: Adds deleted_at, created_by, updated_by to core tables.
-- Author: Antigravity
-- Date: 2026-02-15

-- Projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);

-- Spools
ALTER TABLE public.spools 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);

-- Work Orders
ALTER TABLE public.work_orders 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);

-- Inventory
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);

-- Shipments
ALTER TABLE public.shipments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);

-- Material Requests
ALTER TABLE public.material_requests 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);

-- Quality Checks
ALTER TABLE public.quality_checks 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);

-- Equipment (Bonus)
ALTER TABLE public.equipment
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);


-- Create Index for Soft Delete performance
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON public.projects(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_spools_deleted_at ON public.spools(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_work_orders_deleted_at ON public.work_orders(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_deleted_at ON public.inventory(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_shipments_deleted_at ON public.shipments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_material_requests_deleted_at ON public.material_requests(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quality_checks_deleted_at ON public.quality_checks(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_equipment_deleted_at ON public.equipment(deleted_at) WHERE deleted_at IS NULL;
