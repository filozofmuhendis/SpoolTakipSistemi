import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shipmentService, ShipmentInsert, ShipmentUpdate } from '@/lib/services/shipments'

export const shipmentKeys = {
    all: ['shipments'] as const,
    lists: () => [...shipmentKeys.all, 'list'] as const,
    details: () => [...shipmentKeys.all, 'detail'] as const,
    detail: (id: string) => [...shipmentKeys.details(), id] as const,
}

export function useShipments() {
    return useQuery({
        queryKey: shipmentKeys.lists(),
        queryFn: shipmentService.getAllShipments,
    })
}

export function useShipment(id: string) {
    return useQuery({
        queryKey: shipmentKeys.detail(id),
        queryFn: () => shipmentService.getShipmentById(id),
        enabled: !!id,
    })
}

export function useCreateShipment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (newShipment: ShipmentInsert) => shipmentService.createShipment(newShipment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() })
        },
    })
}

export function useUpdateShipment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ShipmentUpdate }) =>
            shipmentService.updateShipment(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() })
            queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(data.id) })
        },
    })
}

export function useDeleteShipment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => shipmentService.deleteShipment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() })
        },
    })
}
