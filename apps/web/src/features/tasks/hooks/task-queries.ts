import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query';

import type { LocalDate } from '@/shared/lib/local-date.ts';

import { tasksApi } from '../api/tasks-api.ts';
import { taskQueries, taskQueryKeys } from '../api/tasks-query-options.ts';
import { moveBoardItem } from '../helpers/task-board.ts';
import type { TaskInput, TaskRecordView, TaskStatus, TaskView } from '../models/task.ts';

export function useTaskBoard(date: LocalDate) {
    return useQuery(taskQueries.board(date));
}

export function useTaskRecord(taskId: string) {
    return useQuery(taskQueries.record(taskId));
}

/** A `null` version creates the Task in `initialStatus`; a version updates it. */
export type SaveTaskVariables =
    | { input: TaskInput; initialStatus: TaskStatus; version: null }
    | { input: TaskInput; version: string };

/** Creates or updates a Task and refreshes every board and the saved record. */
export function useSaveTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: SaveTaskVariables): Promise<TaskView> =>
            variables.version === null
                ? tasksApi.createTask(variables.input, variables.initialStatus)
                : tasksApi.updateTask(variables.input.id, variables.input, variables.version),
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

export type MoveTaskVariables = {
    date: LocalDate;
    status: TaskStatus;
    task: TaskView;
};

/**
 * Moves a Task to another status on the viewed date. The board updates
 * optimistically and rolls back if the move is rejected.
 */
export function useMoveTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ date, status, task }: MoveTaskVariables): Promise<TaskView> =>
            tasksApi.moveTask(task.id, { effectiveDate: date, status, version: task.version }),
        mutationKey: taskQueryKeys.move,
        onMutate: async ({ date, status, task }) => {
            const queryKey = taskQueryKeys.board(date);
            await queryClient.cancelQueries({ queryKey });
            const previous = queryClient.getQueryData(taskQueries.board(date).queryKey);
            if (previous !== undefined) {
                queryClient.setQueryData(
                    queryKey,
                    moveBoardItem(previous, {
                        ...task,
                        status,
                        statusEffectiveDate: date,
                    }),
                );
            }
            return { previous };
        },
        onSuccess: (movedTask, { date }) => {
            queryClient.setQueryData(taskQueries.board(date).queryKey, (previous) =>
                previous === undefined ? previous : moveBoardItem(previous, movedTask),
            );
        },
        onError: (_error, { date }, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(taskQueryKeys.board(date), context.previous);
            }
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
        },
    });
}

/** Deletes a Task and refreshes every cached board date. */
export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, version }: { taskId: string; version: string }) =>
            tasksApi.deleteTask(taskId, version),
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: taskQueryKeys.boards });
        },
    });
}

/** IDs of Tasks whose move is still being saved. */
export function usePendingTaskMoves(): ReadonlySet<string> {
    const taskIds = useMutationState({
        filters: { mutationKey: taskQueryKeys.move, status: 'pending' },
        select: (mutation) => {
            const variables = mutation.state.variables;
            return isMoveTaskVariables(variables) ? variables.task.id : null;
        },
    });
    return new Set(taskIds.filter((taskId) => taskId !== null));
}

function isMoveTaskVariables(value: unknown): value is MoveTaskVariables {
    return typeof value === 'object' && value !== null && 'task' in value && 'status' in value;
}
