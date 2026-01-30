import { Request, Response, NextFunction } from 'express';
import { _respo } from '../utils/response';
import { BaseError } from '../errors';

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (err instanceof BaseError) {
        _respo(res, {
            error: {
                code: err.code,
                message: err.message,
            },
            status: err.httpStatus,
        });
        return;
    }
    console.error('Unexpected error:', err);
    _respo(res, {
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
        },
        status: 500,
    });
}
