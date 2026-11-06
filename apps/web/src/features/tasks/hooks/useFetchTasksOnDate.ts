import { useQuery } from '@tanstack/react-query';

import { groupBy } from '@/shared/lib/group-by.ts';
import type { LocalDate } from '@/shared/lib/local-date.ts';
import { tasksApi } from '../api/tasks-api.ts';
import {
  TASK_STATUSES,
  type TaskListItem,
  type TasksOnDate,
  type TaskStatus,
} from '../models/task.ts';

export function useFetchTasksOnDate(date: LocalDate) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['listTasks', date],
    queryFn: async () => {
      const res = await tasksApi.listTasks(date);
      return toTasksOnDate(date, res);
    },
  });
  return { data, isLoading, isError, error };
}

const toTasksOnDate = (date: LocalDate, tasks: readonly TaskListItem[]): TasksOnDate => {
  const tasksByStatus = groupBy(tasks, 'status');
  const taskListsByStatus = Object.fromEntries(
    TASK_STATUSES.map((status): [TaskStatus, TaskListItem[]] => [
      status,
      tasksByStatus.get(status) ?? [],
    ]),
  ) as Record<TaskStatus, TaskListItem[]>;

  return {
    date,
    ...taskListsByStatus,
  };
};
