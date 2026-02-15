import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { spoolService, SpoolInsert, SpoolUpdate } from '@/lib/services/spools'

export const spoolKeys = {
    all: ['spools'] as const,
    lists: () => [...spoolKeys.all, 'list'] as const,
    list: (filters: string) => [...spoolKeys.lists(), { filters }] as const,
    details: () => [...spoolKeys.all, 'detail'] as const,
    detail: (id: string) => [...spoolKeys.details(), id] as const,
}

export function useSpools() {
    return useQuery({
        queryKey: spoolKeys.lists(),
        queryFn: spoolService.getAllSpools,
    })
}

export function useSpool(id: string) {
    return useQuery({
        queryKey: spoolKeys.detail(id),
        queryFn: () => spoolService.getSpoolById(id),
        enabled: !!id,
    })
}

export function useCreateSpool() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (newSpool: SpoolInsert) => spoolService.createSpool(newSpool),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: spoolKeys.lists() })
        },
    })
}

export function useUpdateSpool() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: SpoolUpdate }) =>
            spoolService.updateSpool(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: spoolKeys.lists() })
            queryClient.invalidateQueries({ queryKey: spoolKeys.detail(data.id) })
        },
    })
}

export function useDeleteSpool() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => spoolService.deleteSpool(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: spoolKeys.lists() })
        },
    })
}
