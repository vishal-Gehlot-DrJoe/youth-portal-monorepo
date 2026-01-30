import { ObjectId } from 'mongodb';
import { getDb } from '../lib/db';
import { SaveDraftLayoutDTO, LayoutResponseDTO, LayoutStatus, TilePosition } from '../dtos/layout.dto';
import { tileService } from './tile.service';
import { NotFoundError } from '../errors';

class LayoutService {
    private get collection() {
        return getDb().collection('layouts');
    }

    async saveDraft(dto: SaveDraftLayoutDTO): Promise<LayoutResponseDTO> {
        const existingDraft = await this.collection.findOne({ status: 'DRAFT' });

        if (existingDraft) {
            await this.collection.updateOne(
                { _id: existingDraft._id },
                { $set: { tiles: dto.tiles, updatedAt: new Date() } }
            );
            return this.getLayoutById(existingDraft._id.toString());
        }

        const layout = {
            tiles: dto.tiles,
            status: 'DRAFT' as LayoutStatus,
            publishedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await this.collection.insertOne(layout);
        return { _id: result.insertedId.toString(), ...layout };
    }

    async publish(dto: SaveDraftLayoutDTO): Promise<LayoutResponseDTO> {
        await this.collection.updateMany({ status: 'PUBLISHED' }, { $set: { status: 'ARCHIVED' } });
        await tileService.deactivateAllTiles();
        const tileIds = dto.tiles.map((t: TilePosition) => t.tileId);
        if (tileIds.length > 0) {
            await tileService.activateTiles(tileIds);
        }
        const layout = {
            tiles: dto.tiles,
            status: 'PUBLISHED' as LayoutStatus,
            publishedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await this.collection.insertOne(layout);
        await this.collection.updateOne(
            { status: 'DRAFT' },
            { $set: { tiles: dto.tiles, updatedAt: new Date() } },
            { upsert: true }
        );

        return { _id: result.insertedId.toString(), ...layout };
    }

    async getActiveLayout(): Promise<LayoutResponseDTO | null> {
        const layout = await this.collection.findOne({ status: 'PUBLISHED' });
        if (!layout) return null;
        return {
            _id: layout._id.toString(),
            tiles: layout.tiles,
            status: layout.status,
            publishedAt: layout.publishedAt,
            createdAt: layout.createdAt,
            updatedAt: layout.updatedAt,
        };
    }

    async getDraftLayout(): Promise<LayoutResponseDTO | null> {
        const layout = await this.collection.findOne({ status: 'DRAFT' });
        if (!layout) return null;
        return {
            _id: layout._id.toString(),
            tiles: layout.tiles,
            status: layout.status,
            publishedAt: layout.publishedAt,
            createdAt: layout.createdAt,
            updatedAt: layout.updatedAt,
        };
    }

    private async getLayoutById(id: string): Promise<LayoutResponseDTO> {
        const layout = await this.collection.findOne({ _id: new ObjectId(id) });
        if (!layout) throw new NotFoundError('Layout not found');
        return {
            _id: layout._id.toString(),
            tiles: layout.tiles,
            status: layout.status,
            publishedAt: layout.publishedAt,
            createdAt: layout.createdAt,
            updatedAt: layout.updatedAt,
        };
    }
}

export const layoutService = new LayoutService();
