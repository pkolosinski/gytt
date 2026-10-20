import type { LocalDate } from '@/shared/lib/local-date.ts';

export type TaskStatus = 'todo' | 'inProgress' | 'completed';

export const TASK_STATUSES: readonly TaskStatus[] = ['todo', 'inProgress', 'completed'];

export type TaskBoardView = Record<TaskStatus, TaskListItem[]> & {
  date: LocalDate;
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
