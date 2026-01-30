import { Request } from 'express';
import { mediaService, SignedUrlRequest, SignedUrlResponse } from '../services/media.service';
import { ValidationError } from '../errors';

class MediaController {
    async getSignedUrl(req: Request): Promise<SignedUrlResponse> {
        const { filename, contentType, contentLength } = req.body;

        if (!filename || typeof filename !== 'string') {
            throw new ValidationError('filename is required');
        }

        if (!contentType || typeof contentType !== 'string') {
            throw new ValidationError('contentType is required');
        }

        if (!contentLength || typeof contentLength !== 'number' || contentLength <= 0) {
            throw new ValidationError('contentLength is required and must be a positive number');
        }

        const request: SignedUrlRequest = {
            filename,
            contentType,
            contentLength,
        };

        return mediaService.getSignedUploadUrl(request);
    }
}

export const mediaController = new MediaController();
