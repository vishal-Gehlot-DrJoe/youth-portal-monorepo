import httpClient from './httpClient';
import { ApiResponse } from '../types/api';

export interface TilePosition {
    tileId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    order: number;
}

export interface Layout {
    _id: string;
    tiles: TilePosition[];
    status: 'DRAFT' | 'PUBLISHED';
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export async function saveDraftLayout(tiles: TilePosition[]): Promise<Layout> {
    const response = await httpClient.post<ApiResponse<Layout>>('/layouts/draft', { tiles });
    if (!response.data.data) throw new Error('Failed to save draft');
    return response.data.data;
}

export async function publishLayout(data: { tiles: { tileId: string; order: number }[] }): Promise<Layout> {
    const response = await httpClient.post<ApiResponse<Layout>>('/layouts/publish', data);
    if (!response.data.data) throw new Error('Failed to publish layout');
    return response.data.data;
}

export async function getActiveLayout(): Promise<Layout | null> {
    const response = await httpClient.get<ApiResponse<Layout>>('/layouts/active');
    return response.data.data;
}

export async function getDraftLayout(): Promise<Layout | null> {
    const response = await httpClient.get<ApiResponse<Layout>>('/layouts/draft');
    return response.data.data;
}
