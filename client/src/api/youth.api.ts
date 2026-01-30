import httpClient from './httpClient';

export interface YouthEmail {
    _id: string;
    email: string;
    isActive: boolean;
    createdAt: string;
}

export interface YouthEmailsResponse {
    items: YouthEmail[];
    total: number;
    page: number;
    pageSize: number;
}

export interface BulkUploadResponse {
    totalProcessed: number;
    totalInserted: number;
    totalDuplicatesIgnored: number;
}

export interface GetYouthEmailsParams {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const getYouthEmails = async (params: GetYouthEmailsParams): Promise<YouthEmailsResponse> => {
    const { data } = await httpClient.get<YouthEmailsResponse>('/youth-emails', { params });
    return data;
};

export const addYouthEmail = async (email: string): Promise<YouthEmail> => {
    const { data } = await httpClient.post<YouthEmail>('/youth-emails', { email });
    return data;
};

export const bulkUploadYouthEmails = async (emails: string[]): Promise<BulkUploadResponse> => {
    const { data } = await httpClient.post<BulkUploadResponse>('/youth-emails/bulk', { emails });
    return data;
};

export const updateYouthEmailStatus = async (ids: string[], isActive: boolean): Promise<void> => {
    await httpClient.patch('/youth-emails/status', { ids, isActive });
};

export const deleteYouthEmails = async (ids: string[]): Promise<void> => {
    await httpClient.post('/youth-emails/delete', { ids });
};
