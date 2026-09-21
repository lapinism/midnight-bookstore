import {
    addPost,
    editPost,
    removePost
} from './post.service.js';
import { positiveInteger } from '../utils/validation.js';

export async function createPostController(req, res) {
    const post = await addPost({
        ...req.body,
        ip: req.ip
    });

    res.status(201).json(post);
}

export async function updatePostController(req, res) {
    const id = positiveInteger(req.params.id, 'post id');
    const post = await editPost(id, req.body);

    res.json(post);
}

export async function deletePostController(req, res) {
    const id = positiveInteger(req.params.id, 'post id');
    await removePost(id, req.body);

    res.status(204).end();
}
