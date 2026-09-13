import { isWritingOpen } from '../policy/time.service.js';
import { writingClosedError } from '../utils/appError.js';

export function validateWritingOpen(req, res, next) {
    if (!isWritingOpen()) {
        return next(writingClosedError());
    }

    return next();
}
