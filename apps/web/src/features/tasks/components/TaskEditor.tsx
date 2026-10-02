import { useId, useRef, useState, type FormEvent } from 'react';

import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { StatusMessage } from '@/shared/components/StatusMessage.tsx';
import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import { formControlClassName } from '@/shared/lib/form-control.ts';
import type { LocalDate } from '@/shared/lib/local-date.ts';

import { TaskApiError } from '../api/task-api-error.ts';
import {
    validateTaskDraft,
    type TaskDraft,
    type TaskDraftField,
    type TaskDraftStep,
    type TaskFieldErrors,
} from '../helpers/task-draft.ts';
import { useReloadTaskRecord, useSaveTask } from '../hooks/task-queries.ts';
import {
    type TaskInput,
    type TaskRecordView,
    type TaskStatus,
    type TaskView,
} from '../models/task.ts';

interface TaskEditorProps {
    defaultDate: LocalDate;
    /** The status a new Task starts in; ignored when editing. */
    defaultStatus?: TaskStatus;
    initial: TaskRecordView | null;
    onCancel: () => void;
    onSaved: (task: TaskView) => void;
    selectedDate: LocalDate;
    stepsEditable: boolean;
}

type EditorNotice =
    { type: 'conflict' } | { type: 'reloadFailed' } | { type: 'saveFailed'; detail: string };

const DRAFT_FIELDS: readonly TaskDraftField[] = ['title', 'details', 'steps'];

function toDraft(record: TaskRecordView | null, defaultDate: LocalDate): TaskDraft {
    return {
        details: record?.details ?? '',
        startDate: record?.startDate ?? defaultDate,
        steps: record?.steps.map((step) => ({ ...step })) ?? [],
        title: record?.title ?? '',
    };
}

function toInput(taskId: string, draft: TaskDraft): TaskInput {
    const details = draft.details.trim();
    return {
        details: details.length === 0 ? null : details,
        id: taskId,
        startDate: draft.startDate,
        steps: draft.steps.flatMap((step) => {
            const text = step.text.trim();
            return text.length === 0 ? [] : [{ ...step, text }];
        }),
        title: draft.title.trim(),
        type: 'anytime',
    };
}

function toFieldErrors(fields: Record<string, string>): TaskFieldErrors {
    const errors: TaskFieldErrors = {};
    for (const field of DRAFT_FIELDS) {
        const message = fields[field];
        if (message !== undefined) {
            errors[field] = message;
        }
    }
    return errors;
}

/** Owns the Anytime Task draft for creation and editing. */
export function TaskEditor({
    defaultDate,
    defaultStatus = 'todo',
    initial,
    onCancel,
    onSaved,
    selectedDate,
    stepsEditable,
}: TaskEditorProps) {
    const { t } = useTranslation();
    const formId = useId();
    const [taskId] = useState(() => initial?.id ?? crypto.randomUUID());
    const [draft, setDraft] = useState(() => toDraft(initial, defaultDate));
    const [baseVersion, setBaseVersion] = useState(initial?.version ?? null);
    const [fieldErrors, setFieldErrors] = useState<TaskFieldErrors>({});
    const [notice, setNotice] = useState<EditorNotice | null>(null);
    const fieldRefs = useRef<Partial<Record<TaskDraftField, HTMLElement | null>>>({});
    const saveTask = useSaveTask();
    const reloadTaskRecord = useReloadTaskRecord();

    const fieldId = (field: TaskDraftField) => `${formId}-${field}`;
    const errorId = (field: TaskDraftField) => `${formId}-${field}-error`;

    function updateDraft(field: 'title' | 'details', value: string) {
        setDraft((current) => ({ ...current, [field]: value }));
        setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }

    function updateStep(stepId: string, text: string) {
        setDraft((current) => ({
            ...current,
            steps: current.steps.map((step) => (step.id === stepId ? { ...step, text } : step)),
        }));
        setFieldErrors((current) => ({ ...current, steps: undefined }));
    }

    function addStep() {
        const step: TaskDraftStep = {
            id: crypto.randomUUID(),
            isCompleted: false,
            text: '',
        };
        setDraft((current) => ({ ...current, steps: [...current.steps, step] }));
        setFieldErrors((current) => ({ ...current, steps: undefined }));
    }

    function removeStep(stepId: string) {
        setDraft((current) => ({
            ...current,
            steps: current.steps.filter((step) => step.id !== stepId),
        }));
        setFieldErrors((current) => ({ ...current, steps: undefined }));
    }

    function showFieldErrors(errors: TaskFieldErrors) {
        setFieldErrors(errors);
        const firstInvalid = DRAFT_FIELDS.find((field) => errors[field] !== undefined);
        if (firstInvalid !== undefined) {
            fieldRefs.current[firstInvalid]?.focus();
        }
    }

    async function recoverFromConflict() {
        try {
            const latest = await reloadTaskRecord(taskId);
            setDraft(toDraft(latest, defaultDate));
            setBaseVersion(latest.version);
            setFieldErrors({});
            setNotice({ type: 'conflict' });
        } catch {
            setNotice({ type: 'reloadFailed' });
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setNotice(null);

        const errors = validateTaskDraft(draft, t);
        if (Object.keys(errors).length > 0) {
            showFieldErrors(errors);
            return;
        }

        try {
            const input = toInput(taskId, draft);
            const saved = await saveTask.mutateAsync(
                baseVersion === null
                    ? { initialStatus: defaultStatus, input, version: null }
                    : { effectiveDate: selectedDate, input, version: baseVersion },
            );
            onSaved(saved);
        } catch (error) {
            if (error instanceof TaskApiError && error.code === 'VERSION_CONFLICT') {
                await recoverFromConflict();
            } else if (error instanceof TaskApiError && error.code === 'VALIDATION_FAILED') {
                showFieldErrors(toFieldErrors(error.fields ?? {}));
                setNotice({ detail: error.message, type: 'saveFailed' });
            } else {
                setNotice({
                    detail:
                        error instanceof TaskApiError
                            ? error.message
                            : t('tasks.editor.saveUnavailable'),
                    type: 'saveFailed',
                });
            }
        }
    }

    const fieldProps = (field: TaskDraftField) => ({
        'aria-describedby': fieldErrors[field] === undefined ? undefined : errorId(field),
        'aria-invalid': fieldErrors[field] === undefined ? undefined : true,
        id: fieldId(field),
        ref: (element: HTMLElement | null) => {
            fieldRefs.current[field] = element;
        },
    });

    const fieldError = (field: TaskDraftField) =>
        fieldErrors[field] === undefined ? null : (
            <p className="text-sm text-destructive" id={errorId(field)}>
                {fieldErrors[field]}
            </p>
        );

    return (
        <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
            {notice?.type === 'conflict' && (
                <StatusMessage title={t('tasks.editor.conflictTitle')} tone="info">
                    {t('tasks.editor.conflictDescription')}
                </StatusMessage>
            )}
            {notice?.type === 'reloadFailed' && (
                <StatusMessage title={t('tasks.editor.reloadFailedTitle')} tone="error">
                    {t('tasks.editor.reloadFailedDescription')}
                </StatusMessage>
            )}
            {notice?.type === 'saveFailed' && (
                <StatusMessage title={t('tasks.editor.notSavedTitle')} tone="error">
                    {t('tasks.editor.draftKept', { detail: notice.detail })}
                </StatusMessage>
            )}

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor={fieldId('title')}>
                    {t('tasks.editor.title')}{' '}
                    <span aria-hidden="true" className="text-destructive">
                        *
                    </span>
                </label>
                <input
                    {...fieldProps('title')}
                    autoComplete="off"
                    className={formControlClassName}
                    onChange={(event) => updateDraft('title', event.target.value)}
                    required
                    type="text"
                    value={draft.title}
                />
                {fieldError('title')}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor={fieldId('details')}>
                    {t('tasks.editor.description')}
                </label>
                <textarea
                    {...fieldProps('details')}
                    className={formControlClassName}
                    onChange={(event) => updateDraft('details', event.target.value)}
                    rows={4}
                    value={draft.details}
                />
                {fieldError('details')}
            </div>

            <fieldset className="flex flex-col gap-3 border-0 p-0" disabled={!stepsEditable}>
                <legend className="mb-2 text-sm font-medium text-foreground">
                    {t('tasks.steps.title')}
                </legend>
                {draft.steps.map((step, index) => {
                    const stepFieldId = `${formId}-step-${step.id}`;
                    const stepError = fieldErrors.steps;
                    return (
                        <div className="flex items-center gap-2" key={step.id}>
                            <Button
                                aria-label={t('tasks.steps.remove', { number: index + 1 })}
                                onClick={() => removeStep(step.id)}
                                size="icon-sm"
                                type="button"
                                variant="ghost"
                            >
                                <Minus aria-hidden="true" />
                            </Button>
                            <label className="sr-only" htmlFor={stepFieldId}>
                                {t('tasks.steps.editorLabel', { number: index + 1 })}
                            </label>
                            <input
                                aria-describedby={
                                    stepError === undefined ? undefined : errorId('steps')
                                }
                                aria-invalid={stepError === undefined ? undefined : true}
                                className={formControlClassName}
                                id={stepFieldId}
                                onChange={(event) => updateStep(step.id, event.target.value)}
                                ref={(element) => {
                                    if (index === 0) {
                                        fieldRefs.current.steps = element;
                                    }
                                }}
                                type="text"
                                value={step.text}
                            />
                        </div>
                    );
                })}
                {fieldError('steps')}
                {!stepsEditable && (
                    <p className="m-0 text-sm text-muted-foreground">{t('tasks.steps.readOnly')}</p>
                )}
                <Button
                    aria-label={t('tasks.steps.add')}
                    className="self-start"
                    onClick={addStep}
                    size="icon-sm"
                    type="button"
                    variant="outline"
                >
                    <Plus aria-hidden="true" />
                </Button>
            </fieldset>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button onClick={onCancel} type="button" variant="outline">
                    {t('common.cancel')}
                </Button>
                <Button disabled={saveTask.isPending} type="submit">
                    {saveTask.isPending
                        ? t('tasks.editor.saving')
                        : initial === null
                          ? t('tasks.editor.create')
                          : t('tasks.editor.save')}
                </Button>
            </div>
        </form>
    );
}
