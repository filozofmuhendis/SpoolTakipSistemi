import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    qualityCheckService,
    QualityCheckInsert,
    QualityCheckUpdate
} from '@/lib/services/qualityChecks'

// Keys
export const qualityCheckKeys = {
    all: ['qualityChecks'] as const,
    lists: () => [...qualityCheckKeys.all, 'list'] as const,
    list: (filters: string) => [...qualityCheckKeys.lists(), { filters }] as const,
    details: () => [...qualityCheckKeys.all, 'detail'] as const,
    detail: (id: string) => [...qualityCheckKeys.details(), id] as const,
    stats: () => [...qualityCheckKeys.all, 'stats'] as const,
}

// Queries
export function useQualityChecks() {
    return useQuery({
        queryKey: qualityCheckKeys.lists(),
        queryFn: () => qualityCheckService.getAllQualityChecks(),
    })
}

export function useQualityCheck(id: string) {
    return useQuery({
        queryKey: qualityCheckKeys.detail(id),
        queryFn: () => qualityCheckService.getQualityCheckById(id),
        enabled: !!id,
    })
}

export function useQualityChecksBySpool(spoolId: string) {
    return useQuery({
        queryKey: [...qualityCheckKeys.lists(), 'spool', spoolId],
        queryFn: () => qualityCheckService.getQualityChecksBySpoolId(spoolId),
        enabled: !!spoolId,
    })
}

export function useQualityChecksByWorkOrder(workOrderId: string) {
    return useQuery({
        queryKey: [...qualityCheckKeys.lists(), 'workOrder', workOrderId],
        queryFn: () => qualityCheckService.getQualityChecksByWorkOrderId(workOrderId),
        enabled: !!workOrderId,
    })
}

export function useQualityChecksByStatus(status: 'pending' | 'passed' | 'failed' | 'conditional') {
    return useQuery({
        queryKey: [...qualityCheckKeys.lists(), 'status', status],
        queryFn: () => qualityCheckService.getQualityChecksByStatus(status),
    })
}

export function useQualityCheckStats() {
    return useQuery({
        queryKey: qualityCheckKeys.stats(),
        queryFn: () => qualityCheckService.getQualityCheckStats(),
    })
}

export function useLastQualityCheck(spoolId: string) {
    return useQuery({
        queryKey: [...qualityCheckKeys.details(), 'last', 'spool', spoolId],
        queryFn: () => qualityCheckService.getLastQualityCheckForSpool(spoolId),
        enabled: !!spoolId,
    })
}

// Mutations
export function useCreateQualityCheck() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: QualityCheckInsert) => qualityCheckService.createQualityCheck(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: qualityCheckKeys.lists() })
            queryClient.invalidateQueries({ queryKey: qualityCheckKeys.stats() })
        },
    })
}

export function useUpdateQualityCheck() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: QualityCheckUpdate }) =>
            qualityCheckService.updateQualityCheck(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: qualityCheckKeys.lists() })
            queryClient.invalidateQueries({ queryKey: qualityCheckKeys.detail(data.id) })
            queryClient.invalidateQueries({ queryKey: qualityCheckKeys.stats() })
        },
    })
}

export function useDeleteQualityCheck() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => qualityCheckService.deleteQualityCheck(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: qualityCheckKeys.lists() })
            queryClient.invalidateQueries({ queryKey: qualityCheckKeys.stats() })
        },
    })
}

export function usePassQualityCheck() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
            qualityCheckService.passQualityCheck(id, notes),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: qualityCheckKeys.lists() })
            queryClient.invalidateQueries({ queryKey: qualityCheckKeys.detail(data.id) })
            queryClient.invalidateQueries({ queryKey: qualityCheckKeys.stats() })
        },
    })
}

export function useFailQualityCheck() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, defectsFound, correctiveActions, nextCheckDate }: { id: string; defectsFound: string; correctiveActions?: string; nextCheckDate?: string }) =>
            qualityCheckService.failQualityCheck(id, defectsFound, correctiveActions, nextCheckDate),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: qualityCheckKeys.lists() })
            queryClient.invalidateQueries({ queryKey: qualityCheckKeys.detail(data.id) })
            queryClient.invalidateQueries({ queryKey: qualityCheckKeys.stats() })
        },
    })
}
