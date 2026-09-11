/** A device-independent calendar date in canonical `YYYY-MM-DD` form. */
export type LocalDate = string;

const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value: number, length: number): string {
    return String(value).padStart(length, '0');
}

function toUtcDate(year: number, month: number, day: number): Date {
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    return date;
}

function fromUtcDate(date: Date): LocalDate {
    return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1, 2)}-${pad(date.getUTCDate(), 2)}`;
}

/** Returns the value when it is an exact, real calendar date; otherwise `null`. */
export function parseLocalDate(value: string): LocalDate | null {
    const match = LOCAL_DATE_PATTERN.exec(value);
    if (match === null) {
        return null;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = toUtcDate(year, month, day);
    const isExact =
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day;
    return isExact ? value : null;
}

/** The current calendar date on this device. */
export function todayLocalDate(now: Date = new Date()): LocalDate {
    return `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1, 2)}-${pad(now.getDate(), 2)}`;
}

function toUtcDateFromLocalDate(date: LocalDate): Date {
    const [year, month, day] = date.split('-').map(Number);
    return toUtcDate(year, month, day);
}

export function addDays(date: LocalDate, days: number): LocalDate {
    const utcDate = toUtcDateFromLocalDate(date);
    utcDate.setUTCDate(utcDate.getUTCDate() + days);
    return fromUtcDate(utcDate);
}

/** Formats `date` in full form for `locale`, e.g. a BCP 47 language tag such as `pl`. */
export function formatLocalDateLong(date: LocalDate, locale: string): string {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'UTC' }).format(
        toUtcDateFromLocalDate(date),
    );
}

/** Formats `date` in medium form for `locale`, e.g. a BCP 47 language tag such as `pl`. */
export function formatLocalDateShort(date: LocalDate, locale: string): string {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
        toUtcDateFromLocalDate(date),
    );
}
