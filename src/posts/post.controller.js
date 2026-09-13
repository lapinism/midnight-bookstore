import {
    addPost,
    editPost,
    getPostDetail,
    getPosts,
    removePost
} from './post.service.js';
import { positiveInteger } from '../utils/validation.js';

export function listPostsController(req, res) {
    res.json(getPosts(req.query));
}

export function getPostController(req, res) {
    const id = positiveInteger(req.params.id, 'post id');
    res.json(getPostDetail(id));
}

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
