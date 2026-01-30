import { ObjectId } from 'mongodb';
import { getDb } from '../lib/db';
import { CreateTileDTO, TileResponseDTO, TileStatus, TILE_DIMENSIONS } from '../dtos/tile.dto';
import { NotFoundError } from '../errors';
import { mediaService } from './media.service';

class TileService {
    private get collection() {
        return getDb().collection('youthPortalTiles');
    }

    async createTile(dto: CreateTileDTO, createdBy: string): Promise<TileResponseDTO> {
        const dimensions = TILE_DIMENSIONS[dto.size];

        const tile = {
            title: dto.title,
            imageUrl: this.sanitizeImageUrl(dto.imageUrl),
            linkUrl: dto.linkUrl || null,
            size: dto.size,
            width: dimensions.width,
            height: dimensions.height,
            status: 'DRAFT' as TileStatus,
            createdBy,
            createdAt: new Date(),
        };

        const result = await this.collection.insertOne(tile);
        const signedUrl = await mediaService.getSignedViewUrl(tile.imageUrl);

        return {
            _id: result.insertedId.toString(),
            ...tile,
            imageUrl: signedUrl
        };
    }

    async getTilesByStatus(status: TileStatus): Promise<TileResponseDTO[]> {
        const tiles = await this.collection.find({ status }).sort({ createdAt: -1 }).toArray();

        return Promise.all(tiles.map(async (tile) => {
            let signedUrl = tile.imageUrl;

            if (tile.imageUrl) {
                try {
                    signedUrl = await mediaService.getSignedViewUrl(tile.imageUrl);
                } catch (error) {
                    console.error(`Failed to sign URL for tile ${tile._id}:`, error);
                }
            }

            return {
                _id: tile._id.toString(),
                title: tile.title,
                imageUrl: signedUrl,
                linkUrl: tile.linkUrl,
                size: tile.size,
                width: tile.width,
                height: tile.height,
                status: tile.status,
                createdBy: tile.createdBy,
                createdAt: tile.createdAt,
            };
        }));
    }

    async activateTiles(tileIds: string[]): Promise<void> {
        const objectIds = tileIds.map((id) => new ObjectId(id));
        await this.collection.updateMany({ _id: { $in: objectIds } }, { $set: { status: 'ACTIVE' } });
    }

    async deactivateAllTiles(): Promise<void> {
        await this.collection.updateMany({ status: 'ACTIVE' }, { $set: { status: 'DRAFT' } });
    }

    async getTileById(id: string): Promise<TileResponseDTO> {
        const tile = await this.collection.findOne({ _id: new ObjectId(id) });
        if (!tile) throw new NotFoundError('Tile not found');

        let signedUrl = tile.imageUrl;
        if (tile.imageUrl) {
            signedUrl = await mediaService.getSignedViewUrl(tile.imageUrl);
        }

        return {
            _id: tile._id.toString(),
            title: tile.title,
            imageUrl: signedUrl,
            linkUrl: tile.linkUrl,
            size: tile.size,
            width: tile.width,
            height: tile.height,
            status: tile.status,
            createdBy: tile.createdBy,
            createdAt: tile.createdAt,
        };
    }

    async updateTile(id: string, dto: Partial<CreateTileDTO>): Promise<TileResponseDTO> {
        const existingTile = await this.collection.findOne({ _id: new ObjectId(id) });
        if (!existingTile) throw new NotFoundError('Tile not found');

        const updateData: any = { ...dto };
        if (dto.imageUrl) {
            updateData.imageUrl = this.sanitizeImageUrl(dto.imageUrl);
        }

        if (dto.size) {
            const dimensions = TILE_DIMENSIONS[dto.size];
            updateData.width = dimensions.width;
            updateData.height = dimensions.height;
        }

        await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updateData, updatedAt: new Date() } }
        );

        return this.getTileById(id);
    }

    private sanitizeImageUrl(url: string): string {
        if (!url) return url;
        // Strip everything after ? to remove S3 signature if present
        return url.split('?')[0];
    }
}

export const tileService = new TileService();