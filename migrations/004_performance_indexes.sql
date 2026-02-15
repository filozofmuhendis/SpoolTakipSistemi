-- Migration: Performance Indexes (Partial & Composite)
-- Description: Optimizes queries for Active records and common filters.
-- Author: Antigravity
-- Date: 2026-02-15

-- Projects: Frequent filtering by status
CREATE INDEX IF NOT EXISTS idx_projects_status_active 
ON public.projects(status) 
WHERE deleted_at IS NULL;

-- Spools: Filter by Project + Status (Common dashboard query)
CREATE INDEX IF NOT EXISTS idx_spools_project_status_active 
ON public.spools(project_id, status) 
WHERE deleted_at IS NULL;

-- Work Orders: Filter by Assigned User + Status (My Tasks)
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned_status_active 
ON public.work_orders(assigned_to, status) 
WHERE deleted_at IS NULL;

-- Work Orders: Filter by Project (Gantt usage)
CREATE INDEX IF NOT EXISTS idx_work_orders_project_active 
ON public.work_orders(project_id) 
WHERE deleted_at IS NULL;

-- Inventory: Filter by Project + Category
CREATE INDEX IF NOT EXISTS idx_inventory_project_category_active 
ON public.inventory(project_id, category) 
WHERE deleted_at IS NULL;

-- Material Requests: Filter by Status (Pending approvals)
CREATE INDEX IF NOT EXISTS idx_material_requests_status_active 
ON public.material_requests(status) 
WHERE deleted_at IS NULL;
