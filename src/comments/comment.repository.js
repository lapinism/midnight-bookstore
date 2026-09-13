import { db } from '../db/connection.js';

function mapComment(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        postId: row.post_id,
        content: row.content,
        authorName: row.author_name,
        passwordHash: row.password_hash,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

const listByPostStatement = db.prepare(`
    SELECT id, post_id, content, author_name, password_hash, created_at, updated_at
    FROM comments
    WHERE post_id = ?
    ORDER BY created_at ASC, id ASC
`);

const findByIdStatement = db.prepare(`
    SELECT id, post_id, content, author_name, password_hash, created_at, updated_at
    FROM comments
    WHERE id = ?
`);

const insertStatement = db.prepare(`
    INSERT INTO comments (post_id, content, author_name, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
`);

const updateStatement = db.prepare(`
    UPDATE comments
    SET content = ?, updated_at = ?
    WHERE id = ?
`);

const deleteStatement = db.prepare(`
    DELETE FROM comments WHERE id = ?
`);

export function listCommentsByPostId(postId) {
    return listByPostStatement.all(postId).map(mapComment);
}

export function findCommentById(id) {
    return mapComment(findByIdStatement.get(id));
}

export function createComment({ postId, content, authorName, passwordHash, now }) {
    const result = insertStatement.run(postId, content, authorName, passwordHash, now, now);
    return findCommentById(result.lastInsertRowid);
}

export function updateComment(id, { content, now }) {
    updateStatement.run(content, now, id);
    return findCommentById(id);
}

export function deleteComment(id) {
    deleteStatement.run(id);
}
