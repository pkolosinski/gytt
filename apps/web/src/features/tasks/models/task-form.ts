import type { TFunction } from 'i18next';
import * as z from 'zod';

import { TASK_STATUSES, type TaskListItem, type TaskListStep, type TaskStatus } from './task.ts';

export const TITLE_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 1000;
export const STEP_MAX_LENGTH = 100;

export const createTaskFormSchema = (t: TFunction<'tasks'>) =>
  z.object({
    title: z
      .string()
      .trim()
      .min(1, t('validation.titleRequired'))
      .max(TITLE_MAX_LENGTH, t('validation.tooLong', { max: TITLE_MAX_LENGTH })),
    description: z
      .string()
      .trim()
      .max(DESCRIPTION_MAX_LENGTH, t('validation.tooLong', { max: DESCRIPTION_MAX_LENGTH })),
    status: z.enum(TASK_STATUSES),
    steps: z.array(
      z.object({
        name: z
          .string()
          .trim()
          .min(1, t('validation.stepRequired'))
          .max(STEP_MAX_LENGTH, t('validation.tooLong', { max: STEP_MAX_LENGTH })),
        completed: z.boolean(),
      }),
    ),
  });

export type TaskFormValues = z.input<ReturnType<typeof createTaskFormSchema>>;

/** Validated form values in the shape the Task API stores; empty optional parts are omitted. */
export type TaskFields = {
  title: string;
  description?: string;
  status: TaskStatus;
  steps?: TaskListStep[];
};

export const toTaskFields = ({
  title,
  description,
  status,
  steps,
}: z.output<ReturnType<typeof createTaskFormSchema>>): TaskFields => ({
  title,
  status,
  ...(description !== '' && { description }),
  ...(steps.length > 0 && { steps }),
});

export const toTaskFormValues = (task: TaskListItem): TaskFormValues => ({
  title: task.title,
  description: task.description ?? '',
  status: task.status,
  steps: (task.steps ?? []).map(({ name, completed }) => ({ name, completed })),
});
