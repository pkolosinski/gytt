import type { TFunction } from 'i18next';
import { z } from 'zod';

import { localDateSchema } from '@/shared/lib/local-date.ts';
import { DETAILS_MAX_LENGTH, STEP_MAX_LENGTH, TITLE_MAX_LENGTH } from '../models/task.ts';

const taskDraftSchema = z
    .object({
        title: z.string(),
        details: z.string(),
        startDate: localDateSchema,
        steps: z.array(
            z.object({
                id: z.string(),
                text: z.string(),
                isCompleted: z.boolean(),
            }),
        ),
    })
    .superRefine((draft, context) => {
        const title = draft.title.trim();
        if (title.length === 0) {
            context.addIssue({ code: 'custom', message: 'titleRequired', path: ['title'] });
        } else if ([...title].length > TITLE_MAX_LENGTH) {
            context.addIssue({ code: 'custom', message: 'tooLong', path: ['title'] });
        }

        if ([...draft.details.trim()].length > DETAILS_MAX_LENGTH) {
            context.addIssue({ code: 'custom', message: 'tooLong', path: ['details'] });
        }

        if (
            draft.steps.some(
                (step) =>
                    step.text.trim().length > 0 && [...step.text.trim()].length > STEP_MAX_LENGTH,
            )
        ) {
            context.addIssue({ code: 'custom', message: 'tooLong', path: ['steps'] });
        }
    });

const taskSubmissionSchema = taskDraftSchema.superRefine((draft, context) => {
    if (draft.steps.some((step) => step.text.trim().length === 0)) {
        context.addIssue({ code: 'custom', message: 'stepRequired', path: ['steps'] });
    }
});

export type TaskDraft = z.infer<typeof taskDraftSchema>;

export type TaskDraftStep = TaskDraft['steps'][number];

export type TaskDraftField = keyof TaskDraft;

export type TaskFieldErrors = Partial<Record<TaskDraftField, string>>;

function codePointLength(value: string): number {
  return [...value].length;
}

/** Validates a draft; `t` localizes the returned field messages. */
export function validateTaskDraft(
    draft: TaskDraft,
    t: TFunction,
    { requireNonEmptySteps = false }: { requireNonEmptySteps?: boolean } = {},
): TaskFieldErrors {
    const errors: TaskFieldErrors = {};

  const result = (requireNonEmptySteps ? taskSubmissionSchema : taskDraftSchema).safeParse(draft);
    if (result.success) {
    return errors;
  }

  for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === 'title') {
            errors.title =
                issue.message === 'titleRequired'
                    ? t('tasks.validation.titleRequired')
                    : t('tasks.validation.tooLong', { max: TITLE_MAX_LENGTH });
        } else if (field === 'details') {
            errors.details = t('tasks.validation.tooLong', { max: DETAILS_MAX_LENGTH });
        } else if (field === 'steps') {
            errors.steps =
                issue.message === 'stepRequired'
                    ? t('tasks.validation.stepRequired')
                    : t('tasks.validation.tooLong', { max: STEP_MAX_LENGTH });
        } else if (field === 'startDate') {
            errors.startDate = t('tasks.validation.startDateInvalid');
        }
    }

  return errors;
}
