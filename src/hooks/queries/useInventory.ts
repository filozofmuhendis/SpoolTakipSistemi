import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    inventoryService,
    InventoryInsert,
    InventoryUpdate
} from '@/lib/services/inventory'

// Keys
export const inventoryKeys = {
    all: ['inventory'] as const,
    lists: () => [...inventoryKeys.all, 'list'] as const,
    list: (filters: string) => [...inventoryKeys.lists(), { filters }] as const,
    details: () => [...inventoryKeys.all, 'detail'] as const,
    detail: (id: string) => [...inventoryKeys.details(), id] as const,
}

// Queries
export function useInventory() {
    return useQuery({
        queryKey: inventoryKeys.lists(),
        queryFn: () => inventoryService.getAllInventory(),
    })
}

export function useInventoryItem(id: string) {
    return useQuery({
        queryKey: inventoryKeys.detail(id),
        queryFn: () => inventoryService.getInventoryById(id),
        enabled: !!id,
    })
}

export function useLowStockItems() {
    return useQuery({
        queryKey: [...inventoryKeys.lists(), 'low-stock'],
        queryFn: () => inventoryService.getLowStockItems(),
    })
}

export function useInventoryByCategory(category: string) {
    return useQuery({
        queryKey: [...inventoryKeys.lists(), 'category', category],
        queryFn: () => inventoryService.getInventoryByCategory(category),
        enabled: !!category,
    })
}

// Mutations
export function useCreateInventory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: InventoryInsert) => inventoryService.createInventory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
        },
    })
}

export function useUpdateInventory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: InventoryUpdate }) =>
            inventoryService.updateInventory(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
            queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(data.id) })
        },
    })
}

export function useDeleteInventory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => inventoryService.deleteInventory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
        },
    })
}
