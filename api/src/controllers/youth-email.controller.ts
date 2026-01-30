import { Request, Response, NextFunction } from 'express';
import { youthEmailService } from '../services/youth-email.service';
import {
    createYouthEmailSchema,
    youthEmailQuerySchema,
    bulkActionSchema,
    bulkStatusSchema
} from '../schemas/youth-email.schema';

class YouthEmailController {
    async addEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = createYouthEmailSchema.parse(req.body);
            const result = await youthEmailService.addEmail(validatedData);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async bulkUpload(req: Request, res: Response, next: NextFunction) {
        try {
            const { emails } = req.body;

            if (!emails || !Array.isArray(emails)) {
                return res.status(400).json({ error: 'Invalid input: expected an array of emails' });
            }

            const result = await youthEmailService.bulkAddEmails(emails);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getEmails(req: Request, res: Response, next: NextFunction) {
        try {
            const query = youthEmailQuerySchema.parse(req.query);
            const result = await youthEmailService.getEmails(query);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async bulkUpdateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { ids, isActive } = bulkStatusSchema.parse(req.body);
            await youthEmailService.updateStatus(ids, isActive);
            res.json({ message: 'Statuses updated successfully' });
        } catch (error) {
            next(error);
        }
    }

    async bulkDelete(req: Request, res: Response, next: NextFunction) {
        try {
            const { ids } = bulkActionSchema.parse(req.body);
            await youthEmailService.deleteEmails(ids);
            res.json({ message: 'Emails deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

export const youthEmailController = new YouthEmailController();
