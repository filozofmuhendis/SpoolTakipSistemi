import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService, ProjectInsert, ProjectUpdate } from '@/lib/services/projects'

export const projectKeys = {
    all: ['projects'] as const,
    lists: () => [...projectKeys.all, 'list'] as const,
    list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
    details: () => [...projectKeys.all, 'detail'] as const,
    detail: (id: string) => [...projectKeys.details(), id] as const,
}

export function useProjects() {
    return useQuery({
        queryKey: projectKeys.lists(),
        queryFn: projectService.getAllProjects,
    })
}

export function useProject(id: string) {
    return useQuery({
        queryKey: projectKeys.detail(id),
        queryFn: () => projectService.getProjectById(id),
        enabled: !!id,
    })
}

export function useCreateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (newProject: ProjectInsert) => projectService.createProject(newProject),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
        },
    })
}

export function useUpdateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ProjectUpdate }) =>
            projectService.updateProject(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) })
        },
    })
}

export function useDeleteProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => projectService.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
        },
    })
}
