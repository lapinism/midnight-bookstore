import { validationError } from './appError.js';

export function requireText(value, fieldName, maxLength, minLength = 1) {
    if (typeof value !== 'string') {
        throw validationError(`${fieldName} must be a string.`);
    }

    const trimmed = value.trim();

    if (trimmed.length < minLength) {
        throw validationError(`${fieldName} must be at least ${minLength} characters.`);
    }

    if (trimmed.length > maxLength) {
        throw validationError(`${fieldName} must be at most ${maxLength} characters.`);
    }

    return trimmed;
}

export function optionalPositiveInteger(value, fieldName) {
    if (value === undefined) {
        return undefined;
    }

    return positiveInteger(value, fieldName);
}

export function positiveInteger(value, fieldName = 'id') {
    const number = Number(value);

    if (!Number.isInteger(number) || number < 1) {
        throw validationError(`${fieldName} must be a positive integer.`);
    }

    return number;
}
