import type { LocalDate } from '@/shared/lib/local-date.ts';

export const TASK_STATUSES = ['todo', 'inProgress', 'completed'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TasksFromDate = { date: LocalDate } & Record<TaskStatus, TaskListItem[]>;

export type TaskListItem = {
  id: string;
  title: string;
  description?: string;
  createdOn: LocalDate;
  /** The first day the Task is shown; its creation day until scheduling exists. */
  startedOn: LocalDate;
  /** The day the Task was completed; absent unless its status is `completed`. */
  completedOn?: LocalDate;
  /** The last revision seen from the server; sent as the precondition for changes. */
  revision: number;
  status: TaskStatus;
  steps?: TaskListStep[];
};

export type TaskListStep = {
  name: string;
  completed: boolean;
};

export type NewTask = {
  title: string;
  description?: string;
  status: TaskStatus;
  createdOn: LocalDate;
  steps?: TaskListStep[];
};

export type TaskPatch = Partial<Pick<TaskListItem, 'title' | 'description' | 'status' | 'steps'>>;
