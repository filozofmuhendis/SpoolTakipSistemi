import { projectRepository, ProjectInsert, ProjectUpdate } from '@/repositories/projectRepository'

export class ProjectService {
    async getAllProjects() {
        return await projectRepository.findAll()
    }

    async createProject(data: ProjectInsert) {
        // Business Logic: Validate dates, check duplication if needed, etc.
        // For now, simple pass-through with potential for expansion
        if (new Date(data.start_date) > new Date(data.end_date!)) {
            throw new Error('Start date cannot be after end date')
        }
        return await projectRepository.create(data)
    }

    async updateProject(id: string, data: ProjectUpdate) {
        if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
            throw new Error('Start date cannot be after end date')
        }
        return await projectRepository.update(id, data)
    }

    async deleteProject(id: string) {
        // Business Logic: Check if project has active spools/orders before deletion?
        // Supabase Cascade might handle it, but strict service layer might want to check first.
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
