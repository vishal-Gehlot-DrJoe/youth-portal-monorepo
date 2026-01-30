import { getDb } from '../lib/db';
import { NotFoundError, ForbiddenError } from '../errors';
import { ValidateAccessRequestDTO, ValidateAccessResponseDTO } from '../dtos/auth.dto';

export type UserRole = 'admin' | 'youth';

export interface UserRoleInfo {
    role: UserRole;
    email: string;
    name: string;
    allowedAuthMethods: ('email' | 'google')[];
}

class AuthService {
    async validateAccess(dto: ValidateAccessRequestDTO): Promise<ValidateAccessResponseDTO> {
        const db = getDb();
        const email = dto.email.toLowerCase().trim();
        const staffUser = await db.collection('staff').findOne({ email });
        if (staffUser && staffUser.youthPortalAccess === true) {
            return {
                role: 'admin',
                message: 'User is a Youth Portal Admin',
                allowedAuthMethods: ['email'],
            };
        }

        const youthEmail = await db.collection('youthemails').findOne({ email, isActive: true });
        if (!youthEmail) {
            throw new NotFoundError('Email not authorized for Youth Portal access');
        }

        const customer = await db.collection('customers').findOne({ email });
        if (!customer) {
            throw new NotFoundError('Email not authorized for Youth Portal access');
        }

        if (customer && youthEmail) {
            return {
                role: 'youth',
                message: 'User is a Youth Member',
                allowedAuthMethods: ['google','email'],
            };
        }
        throw new NotFoundError('Email not authorized for Youth Portal access');
    }

    async getUserRole(email: string): Promise<UserRoleInfo> {
        const db = getDb();
        const normalizedEmail = email.toLowerCase().trim();

        const staffUser = await db.collection('staff').findOne({ email: normalizedEmail });
        if (staffUser && staffUser.youthPortalAccess === true) {
            return {
                role: 'admin',
                email: normalizedEmail,
                name: staffUser.name || staffUser.displayName || 'Admin',
                allowedAuthMethods: ['email'],
            };
        }

        const customer = await db.collection('customers').findOne({ email: normalizedEmail });
        const youthEmail = await db.collection('youthemails').findOne({ email: normalizedEmail, isActive: true });

        if (customer && youthEmail) {
            return {
                role: 'youth',
                email: normalizedEmail,
                name: customer.firstName ? `${customer.firstName} ${customer.lastName || ''}` : customer.name || 'Youth Member',
                allowedAuthMethods: ['google'],
            };
        }

        throw new ForbiddenError('User not authorized for Youth Portal');
    }
}

export const authService = new AuthService();
