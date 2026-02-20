import { inventoryRepository, InventoryInsert, InventoryUpdate } from '@/repositories/inventoryRepository'
import prisma from '@/lib/prisma'

export class InventoryService {
    async getAllInventory() {
        return await inventoryRepository.findAll()
    }

    async createInventory(data: InventoryInsert) {
        // Generate code if missing
        const inventoryData = {
            ...data,
            code: data.code || `INV-${Date.now()}`,
        }

        // Business Logic: Check if quantity is valid
        if (inventoryData.quantity !== undefined && inventoryData.quantity < 0) {
            throw new Error('Quantity cannot be negative')
        }

        return await inventoryRepository.create(inventoryData)
    }

    async updateInventory(id: string, data: InventoryUpdate) {
        if (typeof data.quantity === 'number' && data.quantity < 0) {
            throw new Error('Quantity cannot be negative')
        }
        return await inventoryRepository.update(id, data)
    }

    async deleteInventory(id: string) {
        return await inventoryRepository.delete(id)
    }

    async getInventoryById(id: string) {
        const item = await inventoryRepository.findById(id)
        if (!item) {
            throw new Error('Inventory item not found')
        }
        return item
    }

    async getLowStockItems() {
        return await inventoryRepository.findLowStock()
    }

    async getInventoryByCategory(category: string) {
        return await inventoryRepository.findByCategory(category)
    }

    async searchInventory(term: string) {
        return await inventoryRepository.search(term)
    }

    // Atomic Add Stock with Ledger
    async addStock(id: string, amount: number, userId: string) {
        if (amount <= 0) throw new Error('Amount must be positive')

        return await prisma.$transaction(async (tx) => {
            const item = await tx.inventory.update({
                where: { id },
                data: {
                    quantity: { increment: amount }
                }
            })

            await tx.inventoryTransaction.create({
                data: {
                    inventory_id: id,
                    delta: amount,
                    type: 'IN',
                    user_id: userId
                }
            })

            return item
        })
    }

    // Atomic Consume Stock with Ledger
    async consumeStock(id: string, amount: number, userId: string) {
        if (amount <= 0) throw new Error('Amount must be positive')

        return await prisma.$transaction(async (tx) => {
            // Optional: Check stock first if we want strict non-negative in App layer
            // const current = await tx.inventory.findUnique({ where: { id } })
            // if (!current || current.quantity < amount) throw new Error('Insufficient stock')

            const item = await tx.inventory.update({
                where: { id },
                data: {
                    quantity: { decrement: amount }
                }
            })

            await tx.inventoryTransaction.create({
                data: {
                    inventory_id: id,
                    delta: -amount,
                    type: 'OUT',
                    user_id: userId
                }
            })

            // Verify non-negative after update if strict constraint not in DB
            if (item.quantity < 0) {
                throw new Error('Insufficient stock (Rolled back)')
            }

            return item
        })
    }
}

export const inventoryService = new InventoryService()
