import { useQuery } from '@tanstack/react-query';

import { groupBy } from '@/shared/lib/group-by.ts';
import type { LocalDate } from '@/shared/lib/local-date.ts';
import { tasksApi } from '../api/tasks-api.ts';
import {
  TASK_STATUSES,
  type TaskListItem,
  type TasksFromDate,
  type TaskStatus,
} from '../models/task.ts';

export function useFetchTasksFromDate(date: LocalDate) {
  const { data, status, error } = useQuery({
    queryKey: ['listTasks', date],
    queryFn: async () => {
      const res = await tasksApi.listTasks(date);
      return toTasksFromDate(date, res);
    },
  });
  return { data, status, error };
}

const toTasksFromDate = (date: LocalDate, tasks: readonly TaskListItem[]): TasksFromDate => {
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
