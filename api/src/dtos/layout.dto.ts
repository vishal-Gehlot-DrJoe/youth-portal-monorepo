export type LayoutStatus = 'DRAFT' | 'PUBLISHED';

export interface TilePosition {
    tileId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    order: number;
}

export interface SaveDraftLayoutDTO {
    tiles: TilePosition[];
}

export interface LayoutResponseDTO {
    _id: string;
    tiles: TilePosition[];
    status: LayoutStatus;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
