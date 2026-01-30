import httpClient from './httpClient';
import { ApiResponse } from '../types/api';

export type TileSize = 'SMALL' | 'LARGE' | 'FULL_WIDTH';
export type TileStatus = 'DRAFT' | 'ACTIVE';

export interface Tile {
    _id: string;
    title: string;
    imageUrl: string;
    linkUrl: string | null;
    size: TileSize;
    width: number;
    height: number;
    status: TileStatus;
    createdBy: string;
    createdAt: string;
}

export interface CreateTileRequest {
    title: string;
    imageUrl: string;
    linkUrl?: string;
    size: TileSize;
}

export async function createTile(data: CreateTileRequest): Promise<Tile> {
    const response = await httpClient.post<ApiResponse<Tile>>('/tiles', data);
    if (!response.data.data) throw new Error('Failed to create tile');
    return response.data.data;
}

export async function getTiles(status: TileStatus = 'DRAFT'): Promise<Tile[]> {
    const response = await httpClient.get<ApiResponse<Tile[]>>('/tiles', {
        params: { status },
    });
    return response.data.data || [];
}

export async function updateTile(id: string, data: Partial<CreateTileRequest>): Promise<Tile> {
    const response = await httpClient.put<ApiResponse<Tile>>(`/tiles/${id}`, data);
    if (!response.data.data) throw new Error('Failed to update tile');
    return response.data.data;
}
