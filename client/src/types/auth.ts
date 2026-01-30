export type UserRole = 'admin' | 'youth';

export interface ValidateAccessResponse {
    role: UserRole | null;
    message: string;
}
