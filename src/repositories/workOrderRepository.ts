import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type WorkOrderCreateInput = Prisma.WorkOrderCreateInput
export type WorkOrderUpdateInput = Prisma.WorkOrderUpdateInput
export type JobOrderInsert = WorkOrderCreateInput
export type JobOrderUpdate = WorkOrderUpdateInput

export const workOrderRepository = {
    // Get all active work orders
    async findAll() {
        return await prisma.workOrder.findMany({
            where: {
                deleted_at: null
            },
            include: {
                assignee: true, // Include User
                project: { select: { name: true } },
                spool: { select: { name: true } }
            },
            orderBy: {
                start_date: 'desc'
            }
        })
    },

    // Create work order
    async create(data: WorkOrderCreateInput) {
        return await prisma.workOrder.create({
            data
        })
    },

    // Update work order
    async update(id: string, data: WorkOrderUpdateInput) {
        return await prisma.workOrder.update({
            where: { id },
            data
        })
    },

    // Soft delete work order
    async delete(id: string) {
        await prisma.workOrder.update({
            where: { id },
            data: {
                deleted_at: new Date()
            }
        })
        return true
    },

    // Find work order by ID
    async findById(id: string) {
        return await prisma.workOrder.findFirst({
            where: {
                id,
                deleted_at: null
            },
            include: {
                assignee: true,
                project: { select: { name: true } },
                spool: { select: { name: true } }
            }
        })
    },

    async findByAssignee(userId: string) {
        return await prisma.workOrder.findMany({
            where: {
                assigned_to: userId,
                deleted_at: null
            },
            include: {
                project: { select: { name: true } },
                spool: { select: { name: true } }
            },
            orderBy: {
                start_date: 'asc'
            }
        })
    }
}
