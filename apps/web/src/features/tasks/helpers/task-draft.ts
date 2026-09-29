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

export function validateTaskDraft(draft: TaskDraft): TaskFieldErrors {
    const errors: TaskFieldErrors = {};
    const title = draft.title.trim();

    if (title.length === 0) {
        errors.title = 'Enter a title.';
    } else if (codePointLength(title) > TITLE_MAX_LENGTH) {
        errors.title = `Use at most ${TITLE_MAX_LENGTH} characters.`;
    }

    if (codePointLength(draft.details.trim()) > DETAILS_MAX_LENGTH) {
        errors.details = `Use at most ${DETAILS_MAX_LENGTH} characters.`;
    }

    if (parseLocalDate(draft.startDate) === null) {
        errors.startDate = 'Choose a valid start date.';
    }

    return errors;
}
