import { getAuthorName } from '../names/name.service.js';
import { getOpenPeriod } from '../policy/time.service.js';
import { hashPassword, verifyPassword } from '../policy/password.service.js';
import { listCommentsByPostId } from '../comments/comment.repository.js';
import { publicComment } from '../comments/comment.service.js';
import { optionalPositiveInteger, requireText } from '../utils/validation.js';
import { notFoundError, passwordMismatchError, validationError } from '../utils/appError.js';
import {
    createPost,
    deletePost,
    findPostById,
    listPosts,
    updatePost
} from './post.repository.js';

function publicPost(post) {
    const { passwordHash, ...rest } = post;
    return rest;
}

function publicPostSummary(post) {
    return {
        id: post.id,
        title: post.title,
        authorName: post.authorName,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
    };
}

export function getPosts(query = {}) {
    const page = optionalPositiveInteger(query.page, 'page');
    const limit = optionalPositiveInteger(query.limit, 'limit');

    if ((page && !limit) || (!page && limit)) {
        throw validationError('page and limit must be used together.');
    }

    return listPosts({ page, limit }).map(publicPostSummary);
}

export function getPostDetail(id) {
    const post = findPostById(id);

    if (!post) {
        throw notFoundError('Post not found.');
    }

    const comments = listCommentsByPostId(id).map((comment) => {
        return publicComment(comment);
    });

    return {
        ...publicPost(post),
        comments
    };
}

export async function addPost({ title, content, password, ip }) {
    const cleanTitle = requireText(title, 'title', 100);
    const cleanContent = requireText(content, 'content', 5000);
    const cleanPassword = requireText(password, 'password', 100, 4);
    const openPeriod = getOpenPeriod();

    if (!openPeriod) {
        throw validationError('No active open period is available.');
    }

    const authorName = getAuthorName(ip, openPeriod);
    const passwordHash = await hashPassword(cleanPassword);
    const now = new Date().toISOString();

    return publicPost(createPost({
        title: cleanTitle,
        content: cleanContent,
        authorName,
        passwordHash,
        now
    }));
}

export async function editPost(id, { title, content, password }) {
    const post = findPostById(id);

    if (!post) {
        throw notFoundError('Post not found.');
    }

    const cleanTitle = requireText(title, 'title', 100);
    const cleanContent = requireText(content, 'content', 5000);
    const cleanPassword = requireText(password, 'password', 100, 4);
    const passwordMatches = await verifyPassword(cleanPassword, post.passwordHash);

    if (!passwordMatches) {
        throw passwordMismatchError();
    }

    return publicPost(updatePost(id, {
        title: cleanTitle,
        content: cleanContent,
        now: new Date().toISOString()
    }));
}

export async function removePost(id, { password }) {
    const post = findPostById(id);

    if (!post) {
        throw notFoundError('Post not found.');
    }

    const cleanPassword = requireText(password, 'password', 100, 4);
    const passwordMatches = await verifyPassword(cleanPassword, post.passwordHash);

    if (!passwordMatches) {
        throw passwordMismatchError();
    }

    deletePost(id);
}
