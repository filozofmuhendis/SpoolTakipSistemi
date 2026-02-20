import { materialRepository, MaterialCreateInput, MaterialUpdateInput } from '@/repositories/materialRepository'

export class MaterialService {
    async getAllMaterials() {
        return await materialRepository.findAll()
    }

    async createMaterial(data: MaterialCreateInput) {
        if (data.stock_quantity && data.stock_quantity < 0) {
            throw new Error('Stock quantity cannot be negative')
        }
        return await materialRepository.create(data)
    }

    async updateMaterial(id: string, data: MaterialUpdateInput) {
        if (data.stock_quantity && typeof data.stock_quantity === 'number' && data.stock_quantity < 0) {
            throw new Error('Stock quantity cannot be negative')
        }
        return await materialRepository.update(id, data)
    }

    async deleteMaterial(id: string) {
        return await materialRepository.delete(id)
    }

    async getMaterialById(id: string) {
        const material = await materialRepository.findById(id)
        if (!material) throw new Error('Material not found')
        return material
    }
}

export const materialService = new MaterialService()
