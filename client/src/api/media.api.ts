import httpClient from './httpClient';
import { ApiResponse } from '../types/api';

export interface SignedUrlRequest {
    filename: string;
    contentType: string;
    contentLength: number;
}

export interface SignedUrlResponse {
    uploadUrl: string;
    publicUrl: string;
    key: string;
}

export async function getSignedUploadUrl(request: SignedUrlRequest): Promise<SignedUrlResponse> {
    const response = await httpClient.post<ApiResponse<SignedUrlResponse>>('/media/signed-url', request);
    if (!response.data.data) throw new Error('Failed to get upload URL');
    return response.data.data;
}

export async function uploadToS3(file: File): Promise<string> {
    const signedUrl = await getSignedUploadUrl({
        filename: file.name,
        contentType: file.type,
        contentLength: file.size,
    });

    await fetch(signedUrl.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type,
        },
    });

    return signedUrl.publicUrl;
}
