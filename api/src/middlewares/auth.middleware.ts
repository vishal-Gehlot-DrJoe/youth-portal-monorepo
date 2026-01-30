import { Request, Response, NextFunction } from 'express';
import { getFirebaseAdmin } from '../config/firebase-admin';
import { AuthError, ForbiddenError } from '../errors';
import { authService } from '../services/auth.service';

export interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        email: string;
        role?: 'admin' | 'youth';
    };
}

export async function verifyFirebaseToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next(new AuthError('Authorization token required'));
        return;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const admin = getFirebaseAdmin();
        const decodedToken = await admin.auth().verifyIdToken(token);
        const email = decodedToken.email || '';
        let role: 'admin' | 'youth' | undefined;
        try {
            const userInfo = await authService.getUserRole(email);
            role = userInfo.role;
        } catch {
        }

        req.user = {
            uid: decodedToken.uid,
            email,
            role,
        };

        next();
    } catch (error) {
        next(new AuthError('Invalid or expired token'));
    }
}

export function requireAdmin(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    if (!req.user) {
        next(new AuthError('Authentication required'));
        return;
    }

    if (req.user.role !== 'admin') {
        next(new ForbiddenError('Admin access required'));
        return;
    }

    next();
}

export function requireYouth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    if (!req.user) {
        next(new AuthError('Authentication required'));
        return;
    }

    if (req.user.role !== 'youth') {
        next(new ForbiddenError('Youth member access required'));
        return;
    }

    next();
}
