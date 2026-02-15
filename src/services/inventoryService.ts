import { inventoryRepository, InventoryInsert, InventoryUpdate } from '@/repositories/inventoryRepository'

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
        if (data.quantity !== undefined && data.quantity < 0) {
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
}

export const inventoryService = new InventoryService()
