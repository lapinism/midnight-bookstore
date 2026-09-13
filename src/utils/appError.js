export class AppError extends Error {
    constructor(statusCode, error, message) {
        super(message);
        this.statusCode = statusCode;
        this.error = error;
    }
}

export function validationError(message) {
    return new AppError(400, 'VALIDATION_ERROR', message);
}

export function notFoundError(message) {
    return new AppError(404, 'NOT_FOUND', message);
}

export function passwordMismatchError() {
    return new AppError(403, 'PASSWORD_MISMATCH', 'Password does not match.');
}

export function writingClosedError() {
    return new AppError(
        403,
        'WRITING_CLOSED',
        'Write operations are allowed only from 21:00:00 to before 06:00:00 KST.'
    );
}
