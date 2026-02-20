import { personnelRepository, PersonnelUpdate } from '@/repositories/personnelRepository'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export class PersonnelService {
    async getAllPersonnel() {
        return await personnelRepository.findAll()
    }

    async getActivePersonnel() {
        return await personnelRepository.findActive()
    }

    async getPersonnelById(id: string) {
        return await personnelRepository.findById(id)
    }

    async getPersonnelStats() {
        const personnel = await personnelRepository.findAll()
        const activeCount = personnel.filter(p => p.status === 'active').length
        const totalCount = personnel.length

        return {
            total: totalCount,
            active: activeCount,
            inactive: totalCount - activeCount
        }
    }

    // Admin Operations
    async createPersonnel(data: { email: string; password: string; full_name: string; phone?: string; department?: string; position?: string }) {
        const { email, password, full_name, department, position } = data

        // Check availability
        const existing = await personnelRepository.findByEmail(email)
        if (existing) {
            throw new Error('User already exists')
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        return await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: full_name,
                role: 'user',
                status: 'active',
                ...(department && { department }),
                ...(position && { position })
            } as any
        })
    }

    async updatePersonnel(id: string, data: PersonnelUpdate) {
        return await personnelRepository.update(id, data)
    }

    async deletePersonnel(id: string) {
        return await personnelRepository.delete(id)
    }

    async getAssignedWork(id: string) {
        return await prisma.workOrder.findMany({
            where: { assigned_to: id },
            include: {
                project: true,
                spool: true
            }
        })
    }
}

export const personnelService = new PersonnelService()
