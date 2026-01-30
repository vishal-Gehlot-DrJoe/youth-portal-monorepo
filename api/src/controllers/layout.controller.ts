import { Request } from 'express';
import { layoutService } from '../services/layout.service';
import { SaveDraftLayoutDTO, LayoutResponseDTO } from '../dtos/layout.dto';

class LayoutController {
    async saveDraft(req: Request): Promise<LayoutResponseDTO> {
        const dto: SaveDraftLayoutDTO = req.body;
        return layoutService.saveDraft(dto);
    }

    async publish(req: Request): Promise<LayoutResponseDTO> {
        const dto: SaveDraftLayoutDTO = req.body;
        return layoutService.publish(dto);
    }

    async getActiveLayout(): Promise<LayoutResponseDTO | null> {
        return layoutService.getActiveLayout();
    }

    async getDraftLayout(): Promise<LayoutResponseDTO | null> {
        return layoutService.getDraftLayout();
    }
}

export const layoutController = new LayoutController();
