import { db } from '../db/connection.js';

function mapPost(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        title: row.title,
        content: row.content,
        authorName: row.author_name,
        passwordHash: row.password_hash,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

const listAllStatement = db.prepare(`
    SELECT id, title, content, author_name, password_hash, created_at, updated_at
    FROM posts
    ORDER BY created_at DESC, id DESC
`);

const listPageStatement = db.prepare(`
    SELECT id, title, content, author_name, password_hash, created_at, updated_at
    FROM posts
    ORDER BY created_at DESC, id DESC
    LIMIT ? OFFSET ?
`);

const findByIdStatement = db.prepare(`
    SELECT id, title, content, author_name, password_hash, created_at, updated_at
    FROM posts
    WHERE id = ?
`);

const insertStatement = db.prepare(`
    INSERT INTO posts (title, content, author_name, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
`);

const updateStatement = db.prepare(`
    UPDATE posts
    SET title = ?, content = ?, updated_at = ?
    WHERE id = ?
`);

const deleteStatement = db.prepare(`
    DELETE FROM posts WHERE id = ?
`);

export function listPosts({ page, limit } = {}) {
    if (page && limit) {
        const offset = (page - 1) * limit;
        return listPageStatement.all(limit, offset).map(mapPost);
    }

    return listAllStatement.all().map(mapPost);
}

export function findPostById(id) {
    return mapPost(findByIdStatement.get(id));
}

export function createPost({ title, content, authorName, passwordHash, now }) {
    const result = insertStatement.run(title, content, authorName, passwordHash, now, now);
    return findPostById(result.lastInsertRowid);
}

export function updatePost(id, { title, content, now }) {
    updateStatement.run(title, content, now, id);
    return findPostById(id);
}

export function deletePost(id) {
    deleteStatement.run(id);
}
