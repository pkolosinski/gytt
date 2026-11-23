import type { TaskListItem, TaskPatch } from '../models/task.ts';

export type StepToggle = {
  patch: TaskPatch;
  /** True when this toggle completed the last open Step of a Task that is not yet Completed. */
  completesAllSteps: boolean;
};

/** Builds the update for checking or unchecking one Step; checking a To do Task starts it. */
export const toggleStep = (task: TaskListItem, index: number, completed: boolean): StepToggle => {
  const steps = (task.steps ?? []).map((step, i) => (i === index ? { ...step, completed } : step));
  const status = completed && task.status === 'todo' ? 'inProgress' : task.status;
  return {
    patch: status === task.status ? { steps } : { steps, status },
    completesAllSteps:
      completed &&
      task.status !== 'completed' &&
      steps.length > 0 &&
      steps.every((s) => s.completed),
  };
};
