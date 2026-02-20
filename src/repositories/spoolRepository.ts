import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type SpoolCreateInput = Prisma.SpoolCreateInput
export type SpoolUpdateInput = Prisma.SpoolUpdateInput
export type SpoolInsert = SpoolCreateInput
export type SpoolUpdate = SpoolUpdateInput

export const spoolRepository = {
    // Get all active spools with optional pagination
    async findAll(skip?: number, take?: number) {
        return await prisma.spool.findMany({
            ...(skip !== undefined && { skip }),
            ...(take !== undefined && { take }),
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
    },

    // Search spools
    async search(query: string) {
        return await prisma.spool.findMany({
            where: {
                deleted_at: null,
                name: {
                    contains: query,
                    mode: 'insensitive'
                }
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
    },

    // Create a new spool
    async create(data: SpoolCreateInput) {
        return await prisma.spool.create({
            data
        })
    },

    // Update a spool
    async update(id: string, data: SpoolUpdateInput) {
        return await prisma.spool.update({
            where: { id },
            data
        })
    },

    // Soft delete a spool
    async delete(id: string) {
        await prisma.spool.update({
            where: { id },
            data: {
                deleted_at: new Date()
            }
        })
        return true
    },

    // Find spool by ID
    async findById(id: string) {
        return await prisma.spool.findFirst({
            where: {
                id,
                deleted_at: null
            }
        })
    }
}
