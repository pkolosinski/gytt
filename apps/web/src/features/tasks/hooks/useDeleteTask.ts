import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tasksApi } from '../api/tasks-api.ts';
import { findCachedTask } from '../helpers/find-cached-task.ts';
import { LIST_TASKS_KEY, TASK_CHANGES_SCOPE } from './query-keys.ts';

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    scope: TASK_CHANGES_SCOPE,
    mutationFn: (id: string) => tasksApi.deleteTask(id, findCachedTask(queryClient, id).revision),
    onSettled: () => queryClient.invalidateQueries({ queryKey: LIST_TASKS_KEY }),
  });
};
