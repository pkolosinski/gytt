import type { LocalDate } from '@/shared/lib/local-date.ts';

export const TASK_STATUSES = ['todo', 'inProgress', 'completed'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TasksOnDate = {
  date: LocalDate;
} & {
  [status in TaskStatus]: TaskListItem[];
};

export type TaskListItem = {
  id: string;
  title: string;
  description?: string;
  createdOn?: LocalDate;
  status: TaskStatus;
  steps?: TaskListStep[];
};

export type TaskListStep = {
  name: string;
  completed: boolean;
};
