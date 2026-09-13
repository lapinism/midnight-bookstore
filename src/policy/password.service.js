import bcrypt from 'bcrypt';

const DEFAULT_BCRYPT_ROUNDS = 12;

function getHashSalt() {
    const salt = process.env.HASH_SALT;

    if (!salt) {
        throw new Error('HASH_SALT is missing.');
    }

    return salt;
}

function getBcryptRounds() {
    const configuredRounds = Number(process.env.BCRYPT_ROUNDS);

    if (Number.isInteger(configuredRounds) && configuredRounds > 0) {
        return configuredRounds;
    }

    return DEFAULT_BCRYPT_ROUNDS;
}

function addHashSalt(password) {
    return `${password}:${getHashSalt()}`;
}

export function hashPassword(password) {
    return bcrypt.hash(addHashSalt(password), getBcryptRounds());
}

export function verifyPassword(password, passwordHash) {
    return bcrypt.compare(addHashSalt(password), passwordHash);
}
