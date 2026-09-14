function getKstParts(date = new Date()) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const parts = Object.fromEntries(
        formatter.formatToParts(date).map((part) => [part.type, part.value])
    );

    return {
        year: Number(parts.year),
        month: Number(parts.month),
        day: Number(parts.day),
        hour: Number(parts.hour),
        minute: Number(parts.minute),
        second: Number(parts.second)
    };
}

function formatDateKey(year, month, day) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function previousDateKey(year, month, day) {
    const utcMidnight = Date.UTC(year, month - 1, day);
    const previous = new Date(utcMidnight - 24 * 60 * 60 * 1000);

    return formatDateKey(
        previous.getUTCFullYear(),
        previous.getUTCMonth() + 1,
        previous.getUTCDate()
    );
}

export function isWritingOpen(date = new Date()) {
    const { hour } = getKstParts(date);
    return hour >= 21 || hour < 6;
}

export function isEditWindowOpen(createdAt, date = new Date()) {
    const EDIT_WINDOW_MS = 10 * 60 * 1000;
    const createdTime = Date.parse(createdAt);

    if (Number.isNaN(createdTime)) {
        return false;
    }

    const elapsed = date.getTime() - createdTime;
    return elapsed >= 0 && elapsed < EDIT_WINDOW_MS;
}

export function getOpenPeriod(date = new Date()) {
    const { year, month, day, hour } = getKstParts(date);

    if (hour >= 21) {
        return formatDateKey(year, month, day);
    }

    if (hour < 6) {
        return previousDateKey(year, month, day);
    }

    return null;
}

export function getWritingStatus(date = new Date()) {
    return {
        isWritingOpen: isWritingOpen(date),
        openPeriod: getOpenPeriod(date)
    };
}
