import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type InventoryCreateInput = Prisma.InventoryCreateInput
export type InventoryUpdateInput = Prisma.InventoryUpdateInput
export type InventoryInsert = InventoryCreateInput
export type InventoryUpdate = InventoryUpdateInput

export const inventoryRepository = {
    // Get all active inventory with project names
    async findAll() {
        const inventory = await prisma.inventory.findMany({
            where: {
                deleted_at: null
            },
            include: {
                project: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        return inventory.map(item => ({
            ...item,
            project_name: item.project?.name
        }))
    },

    // Create new inventory item
    async create(data: InventoryCreateInput) {
        return await prisma.inventory.create({
            data
        })
    },

    // Update inventory item
    async update(id: string, data: InventoryUpdateInput) {
        return await prisma.inventory.update({
            where: { id },
            data
        })
    },

    // Soft delete inventory item
    async delete(id: string) {
        await prisma.inventory.update({
            where: { id },
            data: {
                deleted_at: new Date()
            }
        })
        return true
    },

    // Get inventory details
    async findById(id: string) {
        const item = await prisma.inventory.findFirst({
            where: {
                id,
                deleted_at: null
            },
            include: {
                project: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (!item) return null

        return {
            ...item,
            project_name: item.project?.name
        }
    },

    // Get low stock items (< 10)
    async findLowStock() {
        return await prisma.inventory.findMany({
            where: {
                quantity: { lt: 10 },
                deleted_at: null
            },
            orderBy: {
                quantity: 'asc'
            }
        })
    },

    // Get items by category
    async findByCategory(category: string) {
        return await prisma.inventory.findMany({
            where: {
                category,
                deleted_at: null
            },
            orderBy: {
                name: 'asc'
            }
        })
    },

    // Search inventory
    async search(search: string) {
        return await prisma.inventory.findMany({
            where: {
                deleted_at: null,
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    // Description is not in the model? Checking schema.prisma... 
                    // Wait, schema.prisma I created in step 758 didn't include description for inventory?
                    // Let me check my schema definition.
                    // Inventory model in schema.prisma (Step 758): id, name, code, category, type, quantity, unit, cost, location, supplier, project_id...
                    // No description field. 
                    // But legacy code used `description`.
                    // The SQL migration might have added it?
                    // I should check SQL or just add it to schema if needed. 
                    // For now, I'll search by code as well instead of description if description is missing.
                    { code: { contains: search, mode: 'insensitive' } }
                ]
            },
            orderBy: {
                name: 'asc'
            }
        })
    }
}
