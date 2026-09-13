import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..', '..');
const dataDir = path.join(rootDir, 'data');
const dbPath = path.join(dataDir, 'db.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

fs.mkdirSync(dataDir, { recursive: true });

const shouldInitialize = !fs.existsSync(dbPath);
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

if (shouldInitialize) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
}

export { db, dbPath };
