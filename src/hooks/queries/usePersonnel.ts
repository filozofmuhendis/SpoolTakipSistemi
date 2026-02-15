import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { personnelService, PersonnelUpdate } from '@/lib/services/personnel'

export const personnelKeys = {
    all: ['personnel'] as const,
    lists: () => [...personnelKeys.all, 'list'] as const,
    list: (department?: string) => [...personnelKeys.lists(), { department }] as const,
    details: () => [...personnelKeys.all, 'detail'] as const,
    detail: (id: string) => [...personnelKeys.details(), id] as const,
    stats: () => [...personnelKeys.all, 'stats'] as const,
}

export function usePersonnel(department?: string) {
    return useQuery({
        queryKey: personnelKeys.list(department),
        queryFn: () => department
            ? personnelService.getPersonnelByDepartment(department)
            : personnelService.getAllPersonnel(),
    })
}

export function usePersonnelById(id: string) {
    return useQuery({
        queryKey: personnelKeys.detail(id),
        queryFn: () => personnelService.getPersonnelById(id),
        enabled: !!id,
    })
}

export function useCreatePersonnel() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (newPersonnel: Parameters<typeof personnelService.createPersonnel>[0]) =>
            personnelService.createPersonnel(newPersonnel),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: personnelKeys.lists() })
            queryClient.invalidateQueries({ queryKey: personnelKeys.stats() })
        },
    })
}

export function useUpdatePersonnel() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: PersonnelUpdate }) =>
            personnelService.updatePersonnel(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: personnelKeys.lists() })
            if (data) {
                queryClient.invalidateQueries({ queryKey: personnelKeys.detail(data.id) })
            }
        },
    })
}

export function useDeletePersonnel() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => personnelService.deletePersonnel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: personnelKeys.lists() })
            queryClient.invalidateQueries({ queryKey: personnelKeys.stats() })
        },
    })
}

export function usePersonnelStats() {
    return useQuery({
        queryKey: personnelKeys.stats(),
        queryFn: personnelService.getPersonnelStats,
    })
}
