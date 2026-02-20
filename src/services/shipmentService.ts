import { shipmentRepository, ShipmentCreateInput, ShipmentUpdateInput } from '@/repositories/shipmentRepository'

export class ShipmentService {
    async getAllShipments() {
        return await shipmentRepository.findAll()
    }

    async createShipment(data: ShipmentCreateInput) {
        return await shipmentRepository.create(data)
    }

    async updateShipment(id: string, data: ShipmentUpdateInput) {
        return await shipmentRepository.update(id, data)
    }

    async deleteShipment(id: string) {
        return await shipmentRepository.delete(id)
    }

    async getShipmentById(id: string) {
        const shipment = await shipmentRepository.findById(id)
        if (!shipment) throw new Error('Shipment not found')
        return shipment
    }
}

export const shipmentService = new ShipmentService()
