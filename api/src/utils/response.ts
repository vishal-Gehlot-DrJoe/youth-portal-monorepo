import { Response } from 'express';

export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T | null;
    meta?: Record<string, unknown>;
    error: {
        code: string;
        message: string;
    } | null;
}

export interface RespoOptions<T = unknown> {
    data?: T;
    error?: {
        code: string;
        message: string;
    };
    status?: number;
    meta?: Record<string, unknown>;
}

export function _respo<T = unknown>(res: Response, options: RespoOptions<T>): void {
    const { data = null, error = null, status = 200, meta } = options;

    const response: ApiResponse<T> = {
        success: !error,
        data: error ? null : data,
        error,
    };

    if (meta) {
        response.meta = meta;
    }

    res.status(status).json(response);
}

export function successResponse<T>(res: Response, data: T, meta?: Record<string, unknown>): void {
    _respo(res, { data, meta, status: 200 });
}

export function errorResponse(
    res: Response,
    code: string,
    message: string,
    status: number = 500
): void {
    _respo(res, {
        error: { code, message },
        status,
    });
}
