-- Migration: Enforce Domain Constraints
-- Description: Adds CHECK constraints for data integrity.
-- Author: Antigravity
-- Date: 2026-02-15

-- Projects
ALTER TABLE public.projects
ADD CONSTRAINT check_projects_budget_positive CHECK (budget >= 0),
ADD CONSTRAINT check_projects_dates_valid CHECK (end_date IS NULL OR end_date >= start_date);

-- Spools
ALTER TABLE public.spools
ADD CONSTRAINT check_spools_quantity_positive CHECK (quantity >= 0),
ADD CONSTRAINT check_spools_completed_quantity_positive CHECK (completed_quantity >= 0),
ADD CONSTRAINT check_spools_completed_quantity_valid CHECK (completed_quantity <= quantity);

-- Inventory
ALTER TABLE public.inventory
ADD CONSTRAINT check_inventory_quantity_positive CHECK (quantity >= 0),
ADD CONSTRAINT check_inventory_stocks_positive CHECK (min_stock >= 0 AND max_stock >= 0),
ADD CONSTRAINT check_inventory_cost_positive CHECK (cost >= 0);

-- Work Orders
ALTER TABLE public.work_orders
ADD CONSTRAINT check_work_orders_dates_valid CHECK (due_date IS NULL OR due_date >= start_date),
ADD CONSTRAINT check_work_orders_hours_positive CHECK (
    (estimated_hours IS NULL OR estimated_hours >= 0) AND 
    (actual_hours IS NULL OR actual_hours >= 0)
);

-- Material Request Items
ALTER TABLE public.material_request_items
ADD CONSTRAINT check_material_request_items_quantities CHECK (
    quantity_requested > 0 AND
    (quantity_approved IS NULL OR quantity_approved >= 0) AND
    (quantity_issued IS NULL OR quantity_issued >= 0)
);

-- Shipments
ALTER TABLE public.shipments
ADD CONSTRAINT check_shipments_weight_cost_positive CHECK (
    (total_weight IS NULL OR total_weight >= 0) AND
    (shipping_cost IS NULL OR shipping_cost >= 0)
);

-- Profiles (Salary)
ALTER TABLE public.profiles
ADD CONSTRAINT check_profiles_salary_positive CHECK (salary IS NULL OR salary >= 0);
