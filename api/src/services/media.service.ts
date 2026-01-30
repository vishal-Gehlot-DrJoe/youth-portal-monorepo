import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { ValidationError } from '../errors';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const SIGNED_URL_EXPIRY_SECONDS = 60;
const VIEW_URL_EXPIRY_SECONDS = 3600;

export interface SignedUrlRequest {
    filename: string;
    contentType: string;
    contentLength: number;
}

export interface SignedUrlResponse {
    uploadUrl: string;
    publicUrl: string;
    viewUrl: string;
    key: string;
}

class MediaService {
    private s3Client: S3Client;
    private bucketName: string;
    private region: string;

    constructor() {
        this.region = process.env.AWS_REGION || '';
        this.bucketName = process.env.S3_BUCKET_NAME || '';

        if (!this.region || !this.bucketName) {
            throw new Error('AWS_REGION and S3_BUCKET_NAME environment variables are required');
        }

        this.s3Client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });

        console.log(`S3 MediaService initialized: bucket=${this.bucketName}, region=${this.region}`);
    }
    async getSignedUploadUrl(request: SignedUrlRequest): Promise<SignedUrlResponse> {
        if (!ALLOWED_MIME_TYPES.includes(request.contentType)) {
            throw new ValidationError(
                `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`
            );
        }
        if (request.contentLength > MAX_FILE_SIZE) {
            throw new ValidationError(
                `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
            );
        }

        const ext = this.getExtensionFromMimeType(request.contentType);
        const key = `${randomUUID()}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: request.contentType,
            ContentLength: request.contentLength,
        });

        const uploadUrl = await getSignedUrl(this.s3Client, command, {
            expiresIn: SIGNED_URL_EXPIRY_SECONDS,
        });

        const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

        const viewUrl = await this.getSignedViewUrl(key);

        console.log(`Generated signed URL for upload: key=${key}`);

        return {
            uploadUrl,
            publicUrl,
            viewUrl,
            key,
        };
    }
    async getSignedViewUrl(keyOrUrl: string): Promise<string> {
        let key = keyOrUrl;
        if (keyOrUrl.startsWith('http')) {
            const urlParts = keyOrUrl.split('.amazonaws.com/');
            if (urlParts.length > 1) {
                key = urlParts[1];
            }
        }
        key = key.split('?')[0];

        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        return await getSignedUrl(this.s3Client, command, {
            expiresIn: VIEW_URL_EXPIRY_SECONDS
        });
    }

    private getExtensionFromMimeType(mimeType: string): string {
        const mimeMap: Record<string, string> = {
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/webp': 'webp',
        };
        return mimeMap[mimeType] || 'bin';
    }
}

export const mediaService = new MediaService();