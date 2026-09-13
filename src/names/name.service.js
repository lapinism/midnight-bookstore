import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from '../utils/appError.js';
import { assignNameTransaction } from './name.repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const namesPath = path.join(rootDir, 'config', 'names.json');
const MAX_SUFFIX = 9999;

function loadNameConfig() {
    const raw = fs.readFileSync(namesPath, 'utf8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed.prefixes) || parsed.prefixes.length === 0) {
        throw new Error('config/names.json prefixes must be a non-empty array.');
    }

    if (!Array.isArray(parsed.names) || parsed.names.length === 0) {
        throw new Error('config/names.json names must be a non-empty array.');
    }

    const config = {
        prefixes: parsed.prefixes.map((value) => String(value).trim()).filter(Boolean),
        names: parsed.names.map((value) => String(value).trim()).filter(Boolean)
    };

    if (config.prefixes.length === 0 || config.names.length === 0) {
        throw new Error('config/names.json prefixes and names must contain non-empty strings.');
    }

    return config;
}

const nameConfig = loadNameConfig();
const totalNameCount = nameConfig.prefixes.length * nameConfig.names.length * MAX_SUFFIX;

function sha256(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

function hashToIndex(input, modulo) {
    const digest = sha256(input).slice(0, 12);
    return Number.parseInt(digest, 16) % modulo;
}

function buildCandidate(ip, openPeriod, salt, attempt) {
    const seed = `${ip}:${openPeriod}:${salt}:${attempt}`;
    const prefix = nameConfig.prefixes[hashToIndex(`${seed}:prefix`, nameConfig.prefixes.length)];
    const name = nameConfig.names[hashToIndex(`${seed}:name`, nameConfig.names.length)];
    const suffix = hashToIndex(`${seed}:suffix`, MAX_SUFFIX) + 1;

    return `${prefix} ${name} ${suffix}`;
}

export function getAuthorName(ip, openPeriod) {
    const salt = process.env.HASH_SALT;

    if (!salt) {
        throw new Error('HASH_SALT is missing.');
    }

    const authorName = assignNameTransaction({
        ipHash: sha256(`${ip}:${salt}`),
        openPeriod,
        totalNameCount,
        buildCandidate: (attempt) => buildCandidate(ip, openPeriod, salt, attempt)
    });

    if (!authorName) {
        throw new AppError(503, 'NAME_POOL_EXHAUSTED', 'No anonymous names are available for this open period.');
    }

    return authorName;
}
