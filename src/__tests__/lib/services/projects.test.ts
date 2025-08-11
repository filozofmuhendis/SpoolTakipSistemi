import { projectService } from '@/lib/services/projects'
import { supabase } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('Project Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllProjects', () => {
    it('returns all projects successfully', async () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Project 1',
          status: 'active',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          manager_id: 'user1',
          description: 'Test project 1',
        },
        {
          id: '2',
          name: 'Project 2',
          status: 'completed',
          start_date: '2023-01-01',
          end_date: '2023-12-31',
          manager_id: 'user2',
          description: 'Test project 2',
        },
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockProjects,
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await projectService.getAllProjects()

      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual({ data: mockProjects, error: null })
    })

    it('handles database errors', async () => {
      const mockError = { message: 'Database connection failed' }
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await projectService.getAllProjects()

      expect(result).toEqual({ data: null, error: mockError })
    })
  })

  describe('createProject', () => {
    it('creates a new project successfully', async () => {
      const newProject = {
        name: 'New Project',
        status: 'planning' as const,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        manager_id: 'user1',
        description: 'A new test project',
      }

      const createdProject = {
        id: '3',
        ...newProject,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: createdProject,
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await projectService.createProject(newProject)

      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      expect(mockQuery.insert).toHaveBeenCalledWith(newProject)
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.single).toHaveBeenCalled()
      expect(result).toEqual({ data: createdProject, error: null })
    })

    it('handles creation errors', async () => {
      const newProject = {
        name: 'New Project',
        status: 'planning' as const,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        manager_id: 'user1',
        description: 'A new test project',
      }

      const mockError = { message: 'Duplicate project name' }
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await projectService.createProject(newProject)

      expect(result).toEqual({ data: null, error: mockError })
    })
  })

  describe('updateProject', () => {
    it('updates a project successfully', async () => {
      const projectId = '1'
      const updates = {
        name: 'Updated Project Name',
        status: 'active' as const,
      }

      const updatedProject = {
        id: projectId,
        name: 'Updated Project Name',
        status: 'active',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        manager_id: 'user1',
        description: 'Updated project',
        updated_at: '2024-01-02T00:00:00Z',
      }

      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: updatedProject,
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await projectService.updateProject(projectId, updates)

      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      expect(mockQuery.update).toHaveBeenCalledWith(updates)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', projectId)
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.single).toHaveBeenCalled()
      expect(result).toEqual({ data: updatedProject, error: null })
    })

    it('handles update errors', async () => {
      const projectId = '1'
      const updates = { name: 'Updated Name' }
      const mockError = { message: 'Project not found' }

      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await projectService.updateProject(projectId, updates)

      expect(result).toEqual({ data: null, error: mockError })
    })
  })

  describe('deleteProject', () => {
    it('deletes a project successfully', async () => {
      const projectId = '1'

      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await projectService.deleteProject(projectId)

      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', projectId)
      expect(result).toEqual({ data: null, error: null })
    })

    it('handles deletion errors', async () => {
      const projectId = '1'
      const mockError = { message: 'Cannot delete project with active spools' }

      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await projectService.deleteProject(projectId)

      expect(result).toEqual({ data: null, error: mockError })
    })
  })
})