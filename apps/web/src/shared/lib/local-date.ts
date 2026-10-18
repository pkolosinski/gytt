import { z } from 'zod';

/** A device-independent calendar date in canonical `YYYY-MM-DD` form. */
export type LocalDate = string;

/** Returns the value when it is a real calendar date in the supported year range; otherwise `null`. */
export const parseLocalDate = (value: string): LocalDate | null => {
  const result = z.iso.date().safeParse(value);
  return result.success ? result.data : null;
};

/** The current calendar date on this device. */
export const todayLocalDate = (): LocalDate => {
  return toLocalDate(new Date());
};

export const toLocalDate = (date: Date): LocalDate => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}`;
};

const pad = (value: number, length: number): string => {
  return String(value).padStart(length, '0');
};

const toUtcDate = (year: number, month: number, day: number): Date => {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
};

const fromUtcDate = (date: Date): LocalDate => {
  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1, 2)}-${pad(date.getUTCDate(), 2)}`;
};

const toUtcDateFromLocalDate = (date: LocalDate): Date => {
  const [year, month, day] = date.split('-').map(Number);
  return toUtcDate(year, month, day);
};

export const addDays = (date: LocalDate, days: number): LocalDate => {
  const utcDate = toUtcDateFromLocalDate(date);
  utcDate.setUTCDate(utcDate.getUTCDate() + days);
  return fromUtcDate(utcDate);
};

/** Formats `date` in full form for `locale`, e.g. a BCP 47 language tag such as `pl`. */
export const formatLocalDateLong = (date: LocalDate, locale: string): string => {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'UTC' }).format(
    toUtcDateFromLocalDate(date),
  );
};

/** Formats `date` in medium form for `locale`, e.g. a BCP 47 language tag such as `pl`. */
export const formatLocalDateShort = (date: LocalDate, locale: string): string => {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
    toUtcDateFromLocalDate(date),
  );
};
