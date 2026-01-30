import httpClient from './httpClient';
import { ApiResponse } from '../types/api';

export type UserRole = 'admin' | 'youth';

export interface ValidateAccessResponse {
    role: UserRole | null;
    message: string;
    allowedAuthMethods: ('email' | 'google')[];
}

export interface GetUserRoleResponse {
    role: UserRole;
    email: string;
    name: string;
    allowedAuthMethods: ('email' | 'google')[];
}

export async function validateAccess(email: string): Promise<ValidateAccessResponse> {
    const response = await httpClient.post<ApiResponse<ValidateAccessResponse>>(
        '/auth/validate-access',
        { email: email.toLowerCase().trim() }
    );

    if (!response.data.data) {
        throw new Error('Invalid response from server');
    }

    return response.data.data;
}

export async function getUserRole(): Promise<GetUserRoleResponse> {
    const response = await httpClient.get<ApiResponse<GetUserRoleResponse>>('/auth/get-user-role');

    if (!response.data.data) {
        throw new Error('Invalid response from server');
    }

    return response.data.data;
}
