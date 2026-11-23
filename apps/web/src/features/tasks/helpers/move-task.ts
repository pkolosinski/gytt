import type { TaskListItem, TaskPatch, TaskStatus } from '../models/task.ts';

/** Builds the update for moving a Task to a status; completing a Task completes all its Steps. */
export const moveTask = (task: TaskListItem, status: TaskStatus): TaskPatch | null => {
  if (task.status === status) {
    return null;
  }
  if (status !== 'completed' || task.steps === undefined || task.steps.length === 0) {
    return { status };
  }
  return { status, steps: task.steps.map((step) => ({ ...step, completed: true })) };
};
