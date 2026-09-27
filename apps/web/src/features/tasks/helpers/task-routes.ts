import type { LocalDate } from '@/shared/lib/local-date.ts';

export function tasksPath(date: LocalDate): string {
    return `/tasks/${date}`;
}
