export function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    if (err.statusCode && err.error) {
        return res.status(err.statusCode).json({
            error: err.error,
            message: err.message
        });
    }

    console.error(err);

    return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Internal server error.'
    });
}
