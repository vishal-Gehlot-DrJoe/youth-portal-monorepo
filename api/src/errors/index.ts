export interface ErrorOptions {
    code: string;
    message: string;
    httpStatus: number;
    isOperational?: boolean;
}

export class BaseError extends Error {
    public readonly code: string;
    public readonly httpStatus: number;
    public readonly isOperational: boolean;

    constructor(options: ErrorOptions) {
        super(options.message);
        this.code = options.code;
        this.httpStatus = options.httpStatus;
        this.isOperational = options.isOperational ?? true;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends BaseError {
    constructor(message: string = 'Validation failed') {
        super({
            code: 'VALIDATION_ERROR',
            message,
            httpStatus: 400,
            isOperational: true,
        });
    }
}

export class AuthError extends BaseError {
    constructor(message: string = 'Authentication required') {
        super({
            code: 'AUTH_REQUIRED',
            message,
            httpStatus: 401,
            isOperational: true,
        });
    }
}

export class ForbiddenError extends BaseError {
    constructor(message: string = 'Access denied') {
        super({
            code: 'AUTH_FORBIDDEN',
            message,
            httpStatus: 403,
            isOperational: true,
        });
    }
}

export class NotFoundError extends BaseError {
    constructor(message: string = 'Resource not found') {
        super({
            code: 'NOT_FOUND',
            message,
            httpStatus: 404,
            isOperational: true,
        });
    }
}

export class InternalError extends BaseError {
    constructor(message: string = 'Internal server error') {
        super({
            code: 'INTERNAL_ERROR',
            message,
            httpStatus: 500,
            isOperational: false,
        });
    }
}

export class ConflictError extends BaseError {
    constructor(message: string = 'Conflict occurred') {
        super({
            code: 'CONFLICT',
            message,
            httpStatus: 409,
            isOperational: true,
        });
    }
}
