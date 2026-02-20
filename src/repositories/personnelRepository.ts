import prisma from '@/lib/prisma'
import { Prisma, User } from '@prisma/client'

export type Personnel = User
export type PersonnelInsert = Prisma.UserCreateInput
export type PersonnelUpdate = Prisma.UserUpdateInput

export const personnelRepository = {
    // Get all personnel sorted by name
    async findAll() {
        return await prisma.user.findMany({
            orderBy: {
                name: 'asc'
            }
        })
    },

    // Get active personnel
    async findActive() {
        return await prisma.user.findMany({
            where: {
                status: 'active'
            },
            orderBy: {
                name: 'asc'
            }
        })
    },

    // Get personnel by department
    async findByDepartment(department: string) {
        return await prisma.user.findMany({
            where: {
                department
            },
            orderBy: {
                name: 'asc'
            }
        })
    },

    // Update personnel
    async update(id: string, data: PersonnelUpdate) {
        return await prisma.user.update({
            where: { id },
            data
        })
    },

    // Find personnel by ID
    async findById(id: string) {
        return await prisma.user.findUnique({
            where: { id }
        })
    },

    // Find personnel by Email
    async findByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email }
        })
    },

    // Delete personnel (soft delete if possible, but schema doesn't have deleted_at for User yet)
    async delete(id: string) {
        return await prisma.user.delete({
            where: { id }
        })
    },

    // Get managers
    async findManagers() {
        return await prisma.user.findMany({
            where: {
                position: 'manager'
            },
            orderBy: {
                name: 'asc'
            }
        })
    }
}
