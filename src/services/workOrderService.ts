import { workOrderRepository, JobOrderInsert, JobOrderUpdate } from '@/repositories/workOrderRepository'

export class WorkOrderService {
    async getAllWorkOrders() {
        return await workOrderRepository.findAll()
    }

    async createWorkOrder(data: JobOrderInsert) {
        // Business Logic: Check dates
        if (data.start_date && data.due_date && new Date(data.start_date) > new Date(data.due_date)) {
            throw new Error('Start date cannot be after due date')
        }
        return await workOrderRepository.create(data)
    }

    async updateWorkOrder(id: string, data: JobOrderUpdate) {
        if (data.start_date && data.due_date && new Date(data.start_date) > new Date(data.due_date)) {
            throw new Error('Start date cannot be after due date')
        }
        return await workOrderRepository.update(id, data)
    }

    async deleteWorkOrder(id: string) {
        return await workOrderRepository.delete(id)
    }

    async getWorkOrderById(id: string) {
        const order = await workOrderRepository.findById(id)
        if (!order) {
            throw new Error('Work order not found')
        }
        return order
    }
}

export const workOrderService = new WorkOrderService()
