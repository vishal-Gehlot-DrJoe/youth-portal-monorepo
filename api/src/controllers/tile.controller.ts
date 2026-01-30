import { Request } from 'express';
import { tileService } from '../services/tile.service';
import { CreateTileDTO, TileResponseDTO, TileStatus } from '../dtos/tile.dto';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

class TileController {
    async createTile(req: AuthenticatedRequest): Promise<TileResponseDTO> {
        const dto: CreateTileDTO = req.body;
        const createdBy = req.user?.email || 'unknown';
        return tileService.createTile(dto, createdBy);
    }

    async getTiles(req: AuthenticatedRequest): Promise<TileResponseDTO[]> {
        let status = (req.query.status as TileStatus) || 'DRAFT';
        if (req.user?.role !== 'admin') {
            status = 'ACTIVE';
        }

        return tileService.getTilesByStatus(status);
    }

    async updateTile(req: Request): Promise<TileResponseDTO> {
        const { id } = req.params;
        const dto = req.body;
        return tileService.updateTile(id, dto);
    }
}

export const tileController = new TileController();
