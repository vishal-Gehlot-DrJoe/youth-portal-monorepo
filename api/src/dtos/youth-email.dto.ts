export interface YouthEmail {
    _id: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
}

export interface CreateYouthEmailRequest {
    email: string;
}

export interface YouthEmailResponse {
    _id: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
}

export interface BulkUploadResponse {
    totalProcessed: number;
    totalInserted: number;
    totalDuplicatesIgnored: number;
}

export interface YouthEmailQuery {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface BulkActionRequest {
    ids: string[];
}

export interface BulkStatusRequest extends BulkActionRequest {
    isActive: boolean;
}
