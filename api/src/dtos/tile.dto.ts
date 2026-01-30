export type TileSize = 'FULL_WIDTH' | 'SMALL' | 'LARGE';
export type TileStatus = 'DRAFT' | 'ACTIVE';

export interface CreateTileDTO {
    title: string;
    imageUrl: string;
    linkUrl?: string;
    size: TileSize;
}

export interface TileResponseDTO {
    _id: string;
    title: string;
    imageUrl: string;
    linkUrl: string | null;
    size: TileSize;
    width: number;
    height: number;
    status: TileStatus;
    createdBy: string;
    createdAt: Date;
}

export const TILE_DIMENSIONS: Record<TileSize, { width: number; height: number }> = {
    FULL_WIDTH: { width: 4, height: 1 },
    SMALL: { width: 1, height: 1 },
    LARGE: { width: 2, height: 2 },
};
