import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type MaterialCreateInput = Prisma.MaterialCreateInput
export type MaterialUpdateInput = Prisma.MaterialUpdateInput

export const materialRepository = {
    async findAll() {
        return await prisma.material.findMany({
            orderBy: {
                name: 'asc'
            }
        })
    },

    async create(data: MaterialCreateInput) {
        return await prisma.material.create({
            data
        })
    },

    async update(id: string, data: MaterialUpdateInput) {
        return await prisma.material.update({
            where: { id },
            data
        })
    },

    async delete(id: string) {
        return await prisma.material.delete({
            where: { id }
        })
    },

    async findById(id: string) {
        return await prisma.material.findUnique({
            where: { id }
        })
    }
}
