import { spoolRepository, SpoolInsert, SpoolUpdate } from '@/repositories/spoolRepository'

export class SpoolService {
    async getAllSpools(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        return await spoolRepository.findAll(skip, limit)
    }

    async searchSpools(search: string) {
        return await spoolRepository.search(search)
    }

    async createSpool(data: SpoolInsert) {
        // Validation: Check quantity > 0
        if (data.quantity !== null && data.quantity !== undefined && data.quantity < 1) {
            throw new Error('Quantity must be at least 1')
        }
        return await spoolRepository.create(data)
    }

    async updateSpool(id: string, data: SpoolUpdate) {
        if (typeof data.quantity === 'number' && data.quantity < 1) {
            throw new Error('Quantity must be at least 1')
        }
        return await spoolRepository.update(id, data)
    }

    async deleteSpool(id: string) {
        return await spoolRepository.delete(id)
    }

    async getSpoolById(id: string) {
        const spool = await spoolRepository.findById(id)
        if (!spool) {
            throw new Error('Spool not found')
        }
        return spool
    }
}

export const spoolService = new SpoolService()
