export type UserRole = 'admin' | 'youth';

export interface ValidateAccessRequestDTO {
    email: string;
}

export interface ValidateAccessResponseDTO {
    role: UserRole | null;
    message: string;
    allowedAuthMethods: ('email' | 'google')[];
}

export interface GetUserRoleResponseDTO {
    role: UserRole;
    email: string;
    name: string;
    allowedAuthMethods: ('email' | 'google')[];
}
