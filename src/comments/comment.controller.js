import { addComment, editComment, removeComment } from './comment.service.js';
import { positiveInteger } from '../utils/validation.js';

export async function createCommentController(req, res) {
    const postId = positiveInteger(req.body.postId, 'post id');
    const comment = await addComment(postId, {
        ...req.body,
        ip: req.ip
    });

    res.status(201).json(comment);
}

export async function updateCommentController(req, res) {
    const id = positiveInteger(req.params.id, 'comment id');
    const comment = await editComment(id, req.body);

    res.json(comment);
}

export async function deleteCommentController(req, res) {
    const id = positiveInteger(req.params.id, 'comment id');
    await removeComment(id, req.body);

    res.status(204).end();
}
