import { projectRepository, ProjectInsert, ProjectUpdate } from '@/repositories/projectRepository'

export class ProjectService {
    async getAllProjects(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        return await projectRepository.findAll(skip, limit)
    }

    async createProject(data: ProjectInsert) {
        // Business Logic: Validate dates, check duplication if needed, etc.
        // For now, simple pass-through with potential for expansion
        if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date as any)) {
            throw new Error('Start date cannot be after end date')
        }
        return await projectRepository.create(data)
    }

    async updateProject(id: string, data: ProjectUpdate) {
        if (data.start_date && data.end_date && new Date(data.start_date as any) > new Date(data.end_date as any)) {
            throw new Error('Start date cannot be after end date')
        }
        return await projectRepository.update(id, data)
    }

    async deleteProject(id: string, actor: { id: string, role: string }) {
        if (!['admin', 'manager'].includes(actor.role)) {
            throw new Error('Unauthorized: Insufficient permissions')
        }
        return await projectRepository.delete(id)
    }

    async getProjectById(id: string) {
        const project = await projectRepository.findById(id)
        if (!project) {
            throw new Error('Project not found')
        }
        return project
    }
}

export const projectService = new ProjectService()
