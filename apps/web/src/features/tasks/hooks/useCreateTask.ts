import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tasksApi } from '../api/tasks-api.ts';
import type { NewTask } from '../models/task.ts';
import { LIST_TASKS_KEY } from './query-keys.ts';

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: NewTask) => tasksApi.createTask(task),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LIST_TASKS_KEY }),
  });
};
