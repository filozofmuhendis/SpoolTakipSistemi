-- AlterTable
ALTER TABLE "inventory" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "department" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'active';
