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

/** Formats `date` in full form for `locale`, e.g. a BCP 47 language tag such as `pl`. */
export const formatLocalDateFull = (date: LocalDate, locale: string): string => {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(new Date(date));
};

/** Formats `date` in medium form for `locale`, e.g. a BCP 47 language tag such as `pl`. */
export const formatLocalDateShort = (date: LocalDate, locale: string): string => {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(date));
};

const pad = (value: number, length: number): string => {
  return String(value).padStart(length, '0');
};

export const addDays = (localDate: LocalDate, days: number): LocalDate => {
  const date = new Date(localDate);
  date.setDate(date.getDate() + days);
  return toLocalDate(date);
};
