import { getAuthorName } from '../names/name.service.js';
import { getOpenPeriod } from '../policy/time.service.js';
import { hashPassword, verifyPassword } from '../policy/password.service.js';
import { findPostById } from '../posts/post.repository.js';
import { notFoundError, passwordMismatchError, validationError } from '../utils/appError.js';
import { requireText } from '../utils/validation.js';
import {
    createComment,
    deleteComment,
    findCommentById,
    updateComment
} from './comment.repository.js';

export function publicComment(comment) {
    const { passwordHash, ...rest } = comment;
    return rest;
}

export async function addComment(postId, { content, password, ip }) {
    const post = findPostById(postId);

    if (!post) {
        throw notFoundError('Post not found.');
    }

    const cleanContent = requireText(content, 'comment content', 1000);
    const cleanPassword = requireText(password, 'password', 100, 4);
    const openPeriod = getOpenPeriod();

    if (!openPeriod) {
        throw validationError('No active open period is available.');
    }

    const authorName = getAuthorName(ip, openPeriod);
    const passwordHash = await hashPassword(cleanPassword);
    const now = new Date().toISOString();

    return publicComment(createComment({
        postId,
        content: cleanContent,
        authorName,
        passwordHash,
        now
    }));
}

export async function editComment(id, { content, password }) {
    const comment = findCommentById(id);

    if (!comment) {
        throw notFoundError('Comment not found.');
    }

    const cleanContent = requireText(content, 'comment content', 1000);
    const cleanPassword = requireText(password, 'password', 100, 4);
    const passwordMatches = await verifyPassword(cleanPassword, comment.passwordHash);

    if (!passwordMatches) {
        throw passwordMismatchError();
    }

    return publicComment(updateComment(id, {
        content: cleanContent,
        now: new Date().toISOString()
    }));
}

export async function removeComment(id, { password }) {
    const comment = findCommentById(id);

    if (!comment) {
        throw notFoundError('Comment not found.');
    }

    const cleanPassword = requireText(password, 'password', 100, 4);
    const passwordMatches = await verifyPassword(cleanPassword, comment.passwordHash);

    if (!passwordMatches) {
        throw passwordMismatchError();
    }

    deleteComment(id);
}
