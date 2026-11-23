import type { QueryClient } from '@tanstack/react-query';

import { LIST_TASKS_KEY } from '../hooks/query-keys.ts';
import { TASK_STATUSES, type TaskListItem, type TasksFromDate } from '../models/task.ts';

/** Finds the freshest cached copy of a Task, which carries the revision the server last confirmed. */
export const findCachedTask = (queryClient: QueryClient, id: string): TaskListItem => {
  for (const [, board] of queryClient.getQueriesData<TasksFromDate>({ queryKey: LIST_TASKS_KEY })) {
    const task = board && TASK_STATUSES.flatMap((status) => board[status]).find((t) => t.id === id);
    if (task) {
      return task;
    }
  }
  throw new Error(`Task ${id} is not loaded`);
};
