import type { TFunction } from 'i18next';

import { parseLocalDate } from '@/shared/lib/local-date.ts';

import { DETAILS_MAX_LENGTH, TITLE_MAX_LENGTH } from '../models/task.ts';

export type TaskDraft = {
    title: string;
    details: string;
    startDate: string;
};

export type TaskDraftField = keyof TaskDraft;

export type TaskFieldErrors = Partial<Record<TaskDraftField, string>>;

function codePointLength(value: string): number {
    return [...value].length;
}

/** Validates a draft; `t` localizes the returned field messages. */
export function validateTaskDraft(draft: TaskDraft, t: TFunction): TaskFieldErrors {
    const errors: TaskFieldErrors = {};
    const title = draft.title.trim();

    if (title.length === 0) {
        errors.title = t('tasks.validation.titleRequired');
    } else if (codePointLength(title) > TITLE_MAX_LENGTH) {
        errors.title = t('tasks.validation.tooLong', { max: TITLE_MAX_LENGTH });
    }

    if (codePointLength(draft.details.trim()) > DETAILS_MAX_LENGTH) {
        errors.details = t('tasks.validation.tooLong', { max: DETAILS_MAX_LENGTH });
    }

    if (parseLocalDate(draft.startDate) === null) {
        errors.startDate = t('tasks.validation.startDateInvalid');
    }

    return errors;
}
