export type UserRole = 'admin' | 'youth';

export interface RoleCheckResult {
    role: UserRole | null;
    message: string;
}
