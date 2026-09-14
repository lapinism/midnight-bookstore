import { findCommentById } from '../comments/comment.repository.js';
import { isEditWindowOpen } from '../policy/time.service.js';
import { findPostById } from '../posts/post.repository.js';
import { editWindowExpiredError, notFoundError } from '../utils/appError.js';
import { positiveInteger } from '../utils/validation.js';

const finders = {
    comment: {
        findById: findCommentById,
        notFoundMessage: 'Comment not found.'
    },
    post: {
        findById: findPostById,
        notFoundMessage: 'Post not found.'
    }
};

export function validateEditableWindow(resourceType) {
    return (req, res, next) => {
        const finder = finders[resourceType];
        const id = positiveInteger(req.params.id, `${resourceType} id`);
        const resource = finder.findById(id);

        if (!resource) {
            return next(notFoundError(finder.notFoundMessage));
        }

        if (!isEditWindowOpen(resource.createdAt)) {
            return next(editWindowExpiredError());
        }

        return next();
    };
}
