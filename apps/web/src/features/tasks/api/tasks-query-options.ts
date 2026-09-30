import { queryOptions } from '@tanstack/react-query';

import type { LocalDate } from '@/shared/lib/local-date.ts';

import { tasksApi } from './tasks-api.ts';

export const taskQueryKeys = {
    all: ['tasks'] as const,
    board: (date: LocalDate) => ['tasks', 'board', date] as const,
    boards: ['tasks', 'board'] as const,
    record: (taskId: string) => ['tasks', 'record', taskId] as const,
};

/** Query options usable with hooks, prefetching, and direct cache access. */
export const taskQueries = {
    board: (date: LocalDate) =>
        queryOptions({
            queryFn: () => tasksApi.getBoard(date),
            queryKey: taskQueryKeys.board(date),
        }),
    record: (taskId: string) =>
        queryOptions({
            queryFn: () => tasksApi.getTask(taskId),
            queryKey: taskQueryKeys.record(taskId),
        }),
};
