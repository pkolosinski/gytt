import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tasksApi } from '../api/tasks-api.ts';
import { applyTaskPatch } from '../helpers/apply-task-patch.ts';
import { findCachedTask } from '../helpers/find-cached-task.ts';
import type { TaskPatch, TasksFromDate } from '../models/task.ts';
import { LIST_TASKS_KEY, TASK_CHANGES_SCOPE } from './query-keys.ts';

type UpdateTaskInput = { id: string; patch: TaskPatch };

const UPDATE_TASK_KEY = ['updateTask'];

/** Updates a Task, showing the change on the board immediately and restoring it on failure. */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: UPDATE_TASK_KEY,
    scope: TASK_CHANGES_SCOPE,
    mutationFn: ({ id, patch }: UpdateTaskInput) =>
      tasksApi.updateTask(id, findCachedTask(queryClient, id).revision, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: LIST_TASKS_KEY });
      const previous = queryClient.getQueriesData<TasksFromDate>({ queryKey: LIST_TASKS_KEY });
      queryClient.setQueriesData<TasksFromDate>(
        { queryKey: LIST_TASKS_KEY },
        (board) => board && applyTaskPatch(board, id, patch),
      );
      return { previous };
    },
    onSuccess: ({ id, revision }) =>
      queryClient.setQueriesData<TasksFromDate>(
        { queryKey: LIST_TASKS_KEY },
        (board) => board && applyTaskPatch(board, id, { revision }),
      ),
    onError: (_error, _input, context) => {
      context?.previous.forEach(([queryKey, board]) => queryClient.setQueryData(queryKey, board));
    },
    onSettled: () => {
      // Refetching while later changes are queued would overwrite their optimistic state.
      if (queryClient.isMutating({ mutationKey: UPDATE_TASK_KEY }) === 1) {
        return queryClient.invalidateQueries({ queryKey: LIST_TASKS_KEY });
      }
    },
  });
};
