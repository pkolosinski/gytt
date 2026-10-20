import { todayLocalDate, type LocalDate } from '@/shared/lib/local-date.ts';
import type { TaskListItem } from '../models/task.ts';
import { createMockTasksApi, createSampleTasks } from './mock-tasks-api.ts';

/** The Tasks operations used by the UI. */
export type TasksApi = {
  listTasks(date: LocalDate): Promise<TaskListItem[]>;
};

/**
 * The Tasks API used by the board. It is backed by in-memory sample data until
 * the OpenAPI contract and generated client are connected.
 */
export const tasksApi: TasksApi = createMockTasksApi({
  delayMs: 150,
  tasks: createSampleTasks(todayLocalDate()),
});
