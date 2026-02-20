import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type ProjectCreateInput = Prisma.ProjectCreateInput
export type ProjectUpdateInput = Prisma.ProjectUpdateInput
export type ProjectInsert = ProjectCreateInput
export type ProjectUpdate = ProjectUpdateInput

export const projectRepository = {
    // Get all active projects with optional pagination
    async findAll(skip?: number, take?: number) {
        return await prisma.project.findMany({
            ...(skip !== undefined && { skip }),
            ...(take !== undefined && { take }),
            where: {
                deleted_at: null
            },
            include: {
                manager: true // Include User
            },
            orderBy: {
                created_at: 'desc'
            }
        })
    },

    // Create a new project
    async create(data: ProjectCreateInput) {
        return await prisma.project.create({
            data
        })
    },

    // Update a project
    async update(id: string, data: ProjectUpdateInput) {
        return await prisma.project.update({
            where: { id },
            data
        })
    },

    // Soft delete a project
    async delete(id: string) {
        await prisma.project.update({
            where: { id },
            data: {
                deleted_at: new Date()
            }
        })
        return true
    },

    // Find project by ID (Active only)
    async findById(id: string) {
        return await prisma.project.findFirst({
            where: {
                id,
                deleted_at: null
            },
            include: {
                manager: true
            }
        })
    }
}
