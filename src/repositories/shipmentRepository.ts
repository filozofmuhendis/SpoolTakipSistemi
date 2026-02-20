import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type ShipmentCreateInput = Prisma.ShipmentCreateInput
export type ShipmentUpdateInput = Prisma.ShipmentUpdateInput

export const shipmentRepository = {
    async findAll() {
        return await prisma.shipment.findMany({
            orderBy: {
                shipment_date: 'desc'
            },
            include: {
                project: true
            }
        })
    },

    async create(data: ShipmentCreateInput) {
        return await prisma.shipment.create({
            data
        })
    },

    async update(id: string, data: ShipmentUpdateInput) {
        return await prisma.shipment.update({
            where: { id },
            data
        })
    },

    async delete(id: string) {
        return await prisma.shipment.delete({
            where: { id }
        })
    },

    async findById(id: string) {
        return await prisma.shipment.findUnique({
            where: { id },
            include: {
                project: true
            }
        })
    }
}
