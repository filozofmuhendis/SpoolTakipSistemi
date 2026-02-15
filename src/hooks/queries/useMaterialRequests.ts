import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    materialRequestService,
    MaterialRequestInsert,
    MaterialRequestUpdate,
    MaterialRequestItemInsert,
    MaterialRequestItemUpdate
} from '@/lib/services/materialRequests'

// Keys
export const materialRequestKeys = {
    all: ['materialRequests'] as const,
    lists: () => [...materialRequestKeys.all, 'list'] as const,
    list: (filters: string) => [...materialRequestKeys.lists(), { filters }] as const,
    details: () => [...materialRequestKeys.all, 'detail'] as const,
    detail: (id: string) => [...materialRequestKeys.details(), id] as const,
    items: (requestId: string) => [...materialRequestKeys.detail(requestId), 'items'] as const,
}

// Queries
export function useMaterialRequests() {
    return useQuery({
        queryKey: materialRequestKeys.lists(),
        queryFn: () => materialRequestService.getAllRequests(),
    })
}

export function useMaterialRequest(id: string) {
    return useQuery({
        queryKey: materialRequestKeys.detail(id),
        queryFn: () => materialRequestService.getRequestById(id),
        enabled: !!id,
    })
}

export function useMaterialRequestItems(requestId: string) {
    return useQuery({
        queryKey: materialRequestKeys.items(requestId),
        queryFn: () => materialRequestService.getRequestItems(requestId),
        enabled: !!requestId,
    })
}

export function useMaterialRequestsByStatus(status: 'pending' | 'approved' | 'rejected' | 'fulfilled') {
    return useQuery({
        queryKey: [...materialRequestKeys.lists(), 'status', status],
        queryFn: () => materialRequestService.getRequestsByStatus(status),
    })
}

// Mutations
export function useCreateMaterialRequest() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: MaterialRequestInsert) => materialRequestService.createRequest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() })
        },
    })
}

export function useUpdateMaterialRequest() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: MaterialRequestUpdate }) =>
            materialRequestService.updateRequest(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() })
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.detail(data.id) })
        },
    })
}

export function useDeleteMaterialRequest() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => materialRequestService.deleteRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() })
        },
    })
}

export function useApproveMaterialRequest() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, approvedBy }: { id: string; approvedBy: string }) =>
            materialRequestService.approveRequest(id, approvedBy),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() })
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.detail(data.id) })
        },
    })
}

export function useRejectMaterialRequest() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, approvedBy, notes }: { id: string; approvedBy: string; notes?: string }) =>
            materialRequestService.rejectRequest(id, approvedBy, notes),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() })
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.detail(data.id) })
        },
    })
}

// Item Mutations
export function useAddMaterialRequestItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: MaterialRequestItemInsert) => materialRequestService.addRequestItem(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.items(data.request_id) })
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.detail(data.request_id) }) // Update total stats if needed
        },
    })
}

export function useUpdateMaterialRequestItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: MaterialRequestItemUpdate }) =>
            materialRequestService.updateRequestItem(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.items(data.request_id) })
        },
    })
}

export function useDeleteMaterialRequestItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: string, requestId: string }) =>
            materialRequestService.deleteRequestItem(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.items(variables.requestId) })
        },
    })
}
