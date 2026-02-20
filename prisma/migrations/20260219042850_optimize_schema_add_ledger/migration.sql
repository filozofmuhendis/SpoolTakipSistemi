/*
  Warnings:

  - The `status` column on the `projects` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `shipments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `spools` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `work_orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `work_orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('active', 'completed', 'on_hold', 'cancelled');

-- CreateEnum
CREATE TYPE "SpoolStatus" AS ENUM ('pending', 'in_progress', 'completed', 'on_hold');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "WorkOrderPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('pending', 'shipped', 'delivered', 'returned');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT', 'RETURN');

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "status",
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "shipments" DROP COLUMN "status",
ADD COLUMN     "status" "ShipmentStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "spools" DROP COLUMN "status",
ADD COLUMN     "status" "SpoolStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "work_orders" DROP COLUMN "priority",
ADD COLUMN     "priority" "WorkOrderPriority" NOT NULL DEFAULT 'medium',
DROP COLUMN "status",
ADD COLUMN     "status" "WorkOrderStatus" NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" UUID NOT NULL,
    "inventory_id" UUID NOT NULL,
    "delta" DOUBLE PRECISION NOT NULL,
    "type" "InventoryTransactionType" NOT NULL,
    "user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_transactions_inventory_id_idx" ON "inventory_transactions"("inventory_id");

-- CreateIndex
CREATE INDEX "inventory_transactions_user_id_idx" ON "inventory_transactions"("user_id");

-- CreateIndex
CREATE INDEX "inventory_transactions_created_at_idx" ON "inventory_transactions"("created_at");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_table_name_idx" ON "audit_logs"("table_name");

-- CreateIndex
CREATE INDEX "audit_logs_record_id_idx" ON "audit_logs"("record_id");

-- CreateIndex
CREATE INDEX "inventory_project_id_idx" ON "inventory"("project_id");

-- CreateIndex
CREATE INDEX "inventory_code_idx" ON "inventory"("code");

-- CreateIndex
CREATE INDEX "projects_manager_id_idx" ON "projects"("manager_id");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "shipments_project_id_idx" ON "shipments"("project_id");

-- CreateIndex
CREATE INDEX "shipments_status_idx" ON "shipments"("status");

-- CreateIndex
CREATE INDEX "spools_project_id_idx" ON "spools"("project_id");

-- CreateIndex
CREATE INDEX "spools_status_idx" ON "spools"("status");

-- CreateIndex
CREATE INDEX "work_orders_project_id_idx" ON "work_orders"("project_id");

-- CreateIndex
CREATE INDEX "work_orders_spool_id_idx" ON "work_orders"("spool_id");

-- CreateIndex
CREATE INDEX "work_orders_assigned_to_idx" ON "work_orders"("assigned_to");

-- CreateIndex
CREATE INDEX "work_orders_status_idx" ON "work_orders"("status");

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
