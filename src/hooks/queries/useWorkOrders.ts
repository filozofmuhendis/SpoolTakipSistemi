import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobOrderService, JobOrderInsert, JobOrderUpdate } from '@/lib/services/workOrders'

export const workOrderKeys = {
    all: ['workOrders'] as const,
    lists: () => [...workOrderKeys.all, 'list'] as const,
    details: () => [...workOrderKeys.all, 'detail'] as const,
    detail: (id: string) => [...workOrderKeys.details(), id] as const,
}

export function useJobOrders() {
    return useQuery({
        queryKey: workOrderKeys.lists(),
        queryFn: jobOrderService.getAllJobOrders,
    })
}

export function useJobOrder(id: string) {
    return useQuery({
        queryKey: workOrderKeys.detail(id),
        queryFn: () => jobOrderService.getJobOrderById(id),
        enabled: !!id,
    })
}

export function useCreateJobOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (newJobOrder: JobOrderInsert) => jobOrderService.createJobOrder(newJobOrder),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() })
        },
    })
}

export function useUpdateJobOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: JobOrderUpdate }) =>
            jobOrderService.updateJobOrder(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() })
            queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(data.id) })
        },
    })
}

export function useDeleteJobOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => jobOrderService.deleteJobOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() })
        },
    })
}
