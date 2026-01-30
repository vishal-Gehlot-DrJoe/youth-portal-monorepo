import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTiles, createTile, updateTile, Tile, CreateTileRequest, TileStatus } from '../../api/tiles.api';
import { ApiException } from '../../types/api';

export function useTiles(status: TileStatus = 'DRAFT') {
    return useQuery<Tile[], ApiException>({
        queryKey: ['tiles', status],
        queryFn: () => getTiles(status),
        staleTime: 0, 
        gcTime: 10 * 60 * 1000,
    });
}

export function useCreateTile() {
    const queryClient = useQueryClient();

    return useMutation<Tile, ApiException, CreateTileRequest>({
        mutationFn: createTile,
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['tiles'] });
        },
    });
}

export function useUpdateTile() {
    const queryClient = useQueryClient();

    return useMutation<Tile, ApiException, { id: string; data: Partial<CreateTileRequest> }>({
        mutationFn: ({ id, data }) => updateTile(id, data),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['tiles'] });
            queryClient.refetchQueries({ queryKey: ['layout'] });
        },
    });
}
