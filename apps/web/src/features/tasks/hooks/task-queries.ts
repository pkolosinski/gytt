import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { LocalDate } from '@/shared/lib/local-date.ts';

import type { TaskInput, TaskRecordView, TaskView } from '../models/task.ts';
import { useTasksDataSource } from './tasks-data-source-context.ts';

export const taskQueryKeys = {
    all: ['tasks'] as const,
    board: (date: LocalDate) => ['tasks', 'board', date] as const,
    boards: ['tasks', 'board'] as const,
    record: (taskId: string) => ['tasks', 'record', taskId] as const,
};

export function useTaskBoard(date: LocalDate) {
    const source = useTasksDataSource();
    return useQuery({
        queryFn: () => source.getBoard(date),
        queryKey: taskQueryKeys.board(date),
    });
}

export function useTaskRecord(taskId: string) {
    const source = useTasksDataSource();
    return useQuery({
        queryFn: () => source.getTask(taskId),
        queryKey: taskQueryKeys.record(taskId),
    });
}

type SaveTaskVariables = {
    input: TaskInput;
    version: string | null;
};

/** Creates or updates a Task and refreshes every board and the saved record. */
export function useSaveTask() {
    const source = useTasksDataSource();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ input, version }: SaveTaskVariables): Promise<TaskView> =>
            version === null
                ? source.createTask(input)
                : source.updateTask(input.id, input, version),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
        },
    });
}

/**
 * Reads the current Task by ID after a version conflict and reloads the boards,
 * which may no longer contain the Task.
 */
export function useReloadTaskRecord() {
    const source = useTasksDataSource();
    const queryClient = useQueryClient();

    return async (taskId: string): Promise<TaskRecordView> => {
        const record = await source.getTask(taskId);
        queryClient.setQueryData(taskQueryKeys.record(taskId), record);
        await queryClient.invalidateQueries({ queryKey: taskQueryKeys.boards });
        return record;
    };
}
