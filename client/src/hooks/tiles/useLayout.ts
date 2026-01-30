import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getActiveLayout,
    getDraftLayout,
    saveDraftLayout,
    publishLayout,
    Layout,
    TilePosition,
} from '../../api/layouts.api';
import { ApiException } from '../../types/api';

export function useActiveLayout() {
    return useQuery<Layout | null, ApiException>({
        queryKey: ['layout', 'active'],
        queryFn: getActiveLayout,
        staleTime: 0,
        gcTime: 10 * 60 * 1000,
    });
}

export function useDraftLayout() {
    return useQuery<Layout | null, ApiException>({
        queryKey: ['layout', 'draft'],
        queryFn: getDraftLayout,
        staleTime: 0,
        gcTime: 10 * 60 * 1000,
    });
}

export function useSaveDraft() {
    const queryClient = useQueryClient();

    return useMutation<Layout, ApiException, TilePosition[]>({
        mutationFn: saveDraftLayout,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['layout'] });
        },
    });
}

export function usePublishLayout() {
    const queryClient = useQueryClient();

    return useMutation<Layout, ApiException, { tiles: TilePosition[] }>({
        mutationFn: publishLayout,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['layout'] });
            queryClient.invalidateQueries({ queryKey: ['tiles'] });
        },
    });
}
