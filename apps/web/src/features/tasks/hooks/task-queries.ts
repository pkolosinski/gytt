import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { LocalDate } from '@/shared/lib/local-date.ts';

import { tasksApi } from '../api/tasks-api.ts';
import { taskQueries, taskQueryKeys } from '../api/tasks-query-options.ts';
import type { TaskInput, TaskRecordView, TaskView } from '../models/task.ts';

export function useTaskBoard(date: LocalDate) {
    return useQuery(taskQueries.board(date));
}

export function useTaskRecord(taskId: string) {
    return useQuery(taskQueries.record(taskId));
}

type SaveTaskVariables = {
    input: TaskInput;
    version: string | null;
};

/** Creates or updates a Task and refreshes every board and the saved record. */
export function useSaveTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ input, version }: SaveTaskVariables): Promise<TaskView> =>
            version === null
                ? tasksApi.createTask(input)
                : tasksApi.updateTask(input.id, input, version),
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
    const queryClient = useQueryClient();

    return async (taskId: string): Promise<TaskRecordView> => {
        const record = await queryClient.fetchQuery({
            ...taskQueries.record(taskId),
            staleTime: 0,
        });
        await queryClient.invalidateQueries({ queryKey: taskQueryKeys.boards });
        return record;
    };
}
