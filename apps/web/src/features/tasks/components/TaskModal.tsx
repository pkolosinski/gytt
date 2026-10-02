import { useState } from 'react';

import { Dialog } from '@base-ui/react/dialog';
import type { TFunction } from 'i18next';
import { Pencil, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { StatusMessage } from '@/shared/components/StatusMessage.tsx';
import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import type { LocalDate } from '@/shared/lib/local-date.ts';

import { TaskApiError } from '../api/task-api-error.ts';
import { findTaskInBoard } from '../helpers/task-board.ts';
import type { useTaskMoves } from '../hooks/task-moves.ts';
import { useDeleteTask, useTaskBoard, useTaskRecord } from '../hooks/task-queries.ts';
import { type TaskRecordView, type TaskStatus, type TaskView } from '../models/task.ts';
import { TaskEditor } from './TaskEditor.tsx';
import { TaskStatusMenu } from './TaskStatusMenu.tsx';
import { TaskStepList } from './TaskStepList.tsx';

export type TaskModalState =
    { mode: 'create'; status: TaskStatus } | { mode: 'task'; task: TaskView };

type TaskMoves = ReturnType<typeof useTaskMoves>;

interface TaskModalProps {
    defaultDate: LocalDate;
    isStepPending: boolean;
    moves: TaskMoves;
    onClearStepError: () => void;
    onClose: () => void;
    onCreated: () => void;
    onToggleStep: (
        task: TaskView,
        stepId: string,
        isCompleted: boolean,
    ) => Promise<TaskView | null>;
    selectedDate: LocalDate;
    stepError: { taskId: string; message: string } | null;
    state: TaskModalState | null;
}

/** The single modal used by every Tasks-board card and the create action. */
export function TaskModal({
    defaultDate,
    isStepPending,
    moves,
    onClearStepError,
    onClose,
    onCreated,
    onToggleStep,
    selectedDate,
    stepError,
    state,
}: TaskModalProps) {
    const { t } = useTranslation();

    return (
        <Dialog.Root
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            open={state !== null}
        >
            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
                <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-xl bg-popover p-5 text-left text-sm text-popover-foreground ring-1 ring-foreground/10 transition duration-150 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
                    {state?.mode === 'create' && (
                        <>
                            <TaskModalHeader title={t('tasks.modal.createTitle')} />
                            <TaskEditor
                                defaultDate={defaultDate}
                                defaultStatus={state.status}
                                initial={null}
                                onCancel={onClose}
                                onSaved={() => onCreated()}
                                selectedDate={selectedDate}
                                stepsEditable
                            />
                        </>
                    )}
                    {state?.mode === 'task' && (
                        <TaskRecordContent
                            defaultDate={defaultDate}
                            key={state.task.id}
                            moves={moves}
                            isStepPending={isStepPending}
                            onClearStepError={onClearStepError}
                            onClose={onClose}
                            onToggleStep={onToggleStep}
                            selectedDate={selectedDate}
                            stepError={stepError?.taskId === state.task.id ? stepError : null}
                            task={state.task}
                        />
                    )}
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

interface TaskModalHeaderProps {
    title: string;
}

function TaskModalHeader({ title }: TaskModalHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="font-heading m-0 text-xl font-medium break-words text-foreground">
                {title}
            </Dialog.Title>
            <Dialog.Close
                render={<Button aria-label={t('common.close')} size="icon-sm" variant="ghost" />}
            >
                <X aria-hidden="true" />
            </Dialog.Close>
        </div>
    );
}

interface TaskRecordContentProps {
    defaultDate: LocalDate;
    isStepPending: boolean;
    moves: TaskMoves;
    onClearStepError: () => void;
    onClose: () => void;
    onToggleStep: (
        task: TaskView,
        stepId: string,
        isCompleted: boolean,
    ) => Promise<TaskView | null>;
    selectedDate: LocalDate;
    stepError: { taskId: string; message: string } | null;
    task: TaskView;
}

function TaskRecordContent({
    defaultDate,
    isStepPending,
    moves,
    onClearStepError,
    onClose,
    onToggleStep,
    selectedDate,
    stepError,
    task,
}: TaskRecordContentProps) {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const board = useTaskBoard(selectedDate);
    const currentTask = findTaskInBoard(board.data ?? null, task.id) ?? task;
    const record = useTaskRecord(task.id);

    if (record.isPending) {
        return (
            <>
                <TaskModalHeader title={t('tasks.modal.taskTitle')} />
                <p className="text-muted-foreground" role="status">
                    {t('tasks.modal.loading')}
                </p>
            </>
        );
    }

    if (record.isError) {
        return (
            <>
                <TaskModalHeader title={t('tasks.modal.taskTitle')} />
                <StatusMessage
                    action={
                        <Button onClick={() => void record.refetch()} size="sm" variant="outline">
                            {t('common.retry')}
                        </Button>
                    }
                    title={t('tasks.modal.unavailableTitle')}
                    tone="error"
                >
                    {t('tasks.modal.unavailableDescription')}
                </StatusMessage>
            </>
        );
    }

    if (isEditing) {
        return (
            <>
                <TaskModalHeader title={t('tasks.modal.editTitle')} />
                <TaskEditor
                    defaultDate={defaultDate}
                    initial={record.data}
                    onCancel={() => setIsEditing(false)}
                    onSaved={() => setIsEditing(false)}
                    selectedDate={selectedDate}
                    stepsEditable={currentTask.status !== 'completed'}
                />
            </>
        );
    }

    return (
        <>
            <TaskModalHeader title={record.data.title} />
            <TaskDetails
                moves={moves}
                onDeleted={onClose}
                onEdit={() => setIsEditing(true)}
                isStepPending={isStepPending}
                onClearStepError={onClearStepError}
                onToggleStep={onToggleStep}
                record={record.data}
                stepError={stepError}
                task={currentTask}
            />
        </>
    );
}

interface TaskDetailsProps {
    isStepPending: boolean;
    moves: TaskMoves;
    onClearStepError: () => void;
    onDeleted: () => void;
    onEdit: () => void;
    onToggleStep: (
        task: TaskView,
        stepId: string,
        isCompleted: boolean,
    ) => Promise<TaskView | null>;
    record: TaskRecordView;
    stepError: { taskId: string; message: string } | null;
    task: TaskView;
}

function deleteErrorMessage(t: TFunction, error: unknown): string {
    if (error instanceof TaskApiError && error.code === 'VERSION_CONFLICT') {
        return t('tasks.modal.deleteConflict');
    }
    if (error instanceof TaskApiError && error.code === 'NOT_FOUND') {
        return t('tasks.modal.deleteNotFound');
    }
    if (error instanceof TaskApiError) {
        return error.message;
    }
    return t('tasks.modal.deleteUnavailable');
}

function TaskDetails({
    isStepPending,
    moves,
    onClearStepError,
    onDeleted,
    onEdit,
    onToggleStep,
    record,
    stepError,
    task,
}: TaskDetailsProps) {
    const { t } = useTranslation();
    const deleteTask = useDeleteTask();
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const isMoving = moves.pendingTaskIds.has(task.id);

    async function confirmDelete() {
        setDeleteError(null);
        try {
            await deleteTask.mutateAsync({ taskId: task.id, version: task.version });
            onDeleted();
        } catch (error) {
            setDeleteError(deleteErrorMessage(t, error));
        }
    }

    function requestMove(movingTask: TaskView, status: TaskStatus) {
        void moves.move(movingTask, status, 'menu');
    }

    return (
        <div className="flex flex-col gap-4">
            {record.details !== null && (
                <p className="m-0 break-words whitespace-pre-wrap text-foreground">
                    <span className="font-medium">{t('tasks.modal.description')}</span>{' '}
                    {record.details}
                </p>
            )}
            <TaskStepList
                isPending={isStepPending || isMoving}
                onToggleStep={onToggleStep}
                task={task}
            />
            {stepError !== null && (
                <StatusMessage
                    action={
                        <Button onClick={onClearStepError} size="sm" variant="outline">
                            {t('common.dismiss')}
                        </Button>
                    }
                    title={t('tasks.steps.updateFailedTitle')}
                    tone="error"
                >
                    {stepError.message}
                </StatusMessage>
            )}
            <div className="flex flex-wrap items-center gap-2">
                <TaskStatusMenu
                    isPending={moves.pendingTaskIds.has(task.id)}
                    onFocused={moves.clearFocusTarget}
                    onMove={requestMove}
                    shouldFocus={
                        moves.focusTarget?.taskId === task.id &&
                        moves.focusTarget.status === task.status
                    }
                    task={task}
                />
                <div className="ml-auto flex shrink-0 items-center gap-2">
                    <Button disabled={isMoving} onClick={onEdit} variant="outline">
                        <Pencil aria-hidden="true" data-icon="inline-start" />
                        {t('common.edit')}
                    </Button>
                    <Button
                        disabled={isMoving || deleteTask.isPending}
                        onClick={() => {
                            setDeleteError(null);
                            setIsConfirmingDelete(true);
                        }}
                        variant="destructive"
                    >
                        <Trash2 aria-hidden="true" data-icon="inline-start" />
                        {t('common.delete')}
                    </Button>
                </div>
            </div>
            <p aria-live="polite" className="sr-only" role="status">
                {moves.announcement}
            </p>
            {moves.errorTaskId === task.id && moves.error !== null && (
                <StatusMessage
                    action={
                        <Button onClick={moves.dismissError} size="sm" variant="outline">
                            {t('common.dismiss')}
                        </Button>
                    }
                    title={t('tasks.notMovedTitle')}
                    tone="error"
                >
                    {moves.error}
                </StatusMessage>
            )}
            <Dialog.Root
                onOpenChange={(open) => {
                    if (!deleteTask.isPending) {
                        setIsConfirmingDelete(open);
                        if (!open) {
                            setDeleteError(null);
                        }
                    }
                }}
                open={isConfirmingDelete}
            >
                <Dialog.Portal>
                    <Dialog.Backdrop className="fixed inset-0 z-[60] bg-black/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
                    <Dialog.Popup
                        className="fixed top-1/2 left-1/2 z-[60] flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-xl bg-popover p-5 text-left text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none"
                        role="alertdialog"
                    >
                        <Dialog.Title className="font-heading m-0 text-xl font-medium text-foreground">
                            {t('tasks.modal.deleteTitle')}
                        </Dialog.Title>
                        <Dialog.Description className="m-0 text-muted-foreground">
                            {t('tasks.modal.deleteDescription', { title: record.title })}
                        </Dialog.Description>
                        {deleteError !== null && (
                            <StatusMessage title={t('tasks.modal.notDeletedTitle')} tone="error">
                                {deleteError}
                            </StatusMessage>
                        )}
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button
                                disabled={deleteTask.isPending}
                                onClick={() => setIsConfirmingDelete(false)}
                                variant="outline"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                disabled={deleteTask.isPending}
                                onClick={() => void confirmDelete()}
                                variant="destructive"
                            >
                                {deleteTask.isPending
                                    ? t('tasks.modal.deleting')
                                    : t('tasks.modal.deleteTask')}
                            </Button>
                        </div>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
