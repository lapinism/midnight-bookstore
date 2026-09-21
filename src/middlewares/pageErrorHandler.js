import { getWritingStatus } from '../policy/time.service.js';

export function pageErrorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const { isWritingOpen } = getWritingStatus();

    if (err.statusCode && err.error) {
        return res.status(err.statusCode).render('error', {
            error: err.error,
            message: err.message,
            isWritingOpen
        });
    }

    console.error(err);

    return res.status(500).render('error', {
        error: 'INTERNAL_ERROR',
        message: 'Internal server error.',
        isWritingOpen
    });
}
