import { parseLocalDate } from '@/shared/lib/local-date.ts';

import { DETAILS_MAX_LENGTH, TITLE_MAX_LENGTH } from '../models/task.ts';

export type TaskDraft = {
    title: string;
    details: string;
    startDate: string;
};

export type TaskDraftField = keyof TaskDraft;

export type TaskFieldError =
    'titleRequired' | 'titleTooLong' | 'detailsTooLong' | 'invalidStartDate';

export type TaskFieldErrors = Partial<Record<TaskDraftField, TaskFieldError>>;

function codePointLength(value: string): number {
    return [...value].length;
}

export function validateTaskDraft(draft: TaskDraft): TaskFieldErrors {
    const errors: TaskFieldErrors = {};
    const title = draft.title.trim();

    if (title.length === 0) {
        errors.title = 'titleRequired';
    } else if (codePointLength(title) > TITLE_MAX_LENGTH) {
        errors.title = 'titleTooLong';
    }

    if (codePointLength(draft.details.trim()) > DETAILS_MAX_LENGTH) {
        errors.details = 'detailsTooLong';
    }

    if (parseLocalDate(draft.startDate) === null) {
        errors.startDate = 'invalidStartDate';
    }

    return errors;
}
