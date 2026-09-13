import { db } from '../db/connection.js';

const findByIpStatement = db.prepare(`
    SELECT author_name
    FROM name_assignments
    WHERE ip_hash = ? AND open_period = ?
`);

const findByNameStatement = db.prepare(`
    SELECT author_name, ip_hash, open_period
    FROM name_assignments
    WHERE author_name = ?
`);

const insertStatement = db.prepare(`
    INSERT INTO name_assignments (author_name, ip_hash, open_period)
    VALUES (?, ?, ?)
`);

const claimExpiredNameStatement = db.prepare(`
    UPDATE name_assignments
    SET ip_hash = ?, open_period = ?
    WHERE author_name = ? AND open_period != ?
`);

function findCurrentName(ipHash, openPeriod) {
    const existing = findByIpStatement.get(ipHash, openPeriod);

    return existing?.author_name ?? null;
}

export const assignNameTransaction = db.transaction(({ ipHash, openPeriod, totalNameCount, buildCandidate }) => {
    const existing = findCurrentName(ipHash, openPeriod);

    if (existing) {
        return existing;
    }

    for (let attempt = 0; attempt < totalNameCount; attempt += 1) {
        const candidate = buildCandidate(attempt);

        try {
            insertStatement.run(candidate, ipHash, openPeriod);
            return candidate;
        } catch (error) {
            if (error.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
                throw error;
            }
        }

        const assignedDuringInsert = findCurrentName(ipHash, openPeriod);

        if (assignedDuringInsert) {
            return assignedDuringInsert;
        }

        const usedName = findByNameStatement.get(candidate);

        if (usedName?.open_period === openPeriod) {
            continue;
        }

        try {
            const result = claimExpiredNameStatement.run(ipHash, openPeriod, candidate, openPeriod);

            if (result.changes > 0) {
                return candidate;
            }
        } catch (error) {
            if (error.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
                throw error;
            }

            const assignedDuringUpdate = findCurrentName(ipHash, openPeriod);

            if (assignedDuringUpdate) {
                return assignedDuringUpdate;
            }
        }
    }

    return null;
});
