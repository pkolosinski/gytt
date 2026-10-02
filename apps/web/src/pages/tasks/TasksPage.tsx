import { useState } from 'react';

import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
    TaskApiError,
    TaskBoard,
    TaskBoardError,
    TaskCompletionDialog,
    TaskDateNavigation,
    TaskModal,
    tasksPath,
    useTaskBoard,
    useTaskMoves,
    useToggleTaskStep,
    type TaskModalState,
    type TaskView,
} from '@/features/tasks/index.ts';
import { StatusMessage } from '@/shared/components/StatusMessage.tsx';
import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import { formatLocalDateLong, todayLocalDate, type LocalDate } from '@/shared/lib/local-date.ts';

interface TasksPageProps {
    date: LocalDate;
}

type StepCompletionRequest = {
    source: 'drag' | 'menu';
    task: TaskView;
};

export function TasksPage({ date }: TasksPageProps) {
    const { i18n, t } = useTranslation();
    const navigate = useNavigate();
    const today = todayLocalDate();
    const board = useTaskBoard(date);
    const moves = useTaskMoves(date);
    const stepMutation = useToggleTaskStep();
    const [modal, setModal] = useState<TaskModalState | null>(null);
    const [taskToComplete, setTaskToComplete] = useState<StepCompletionRequest | null>(null);
    const [stepError, setStepError] = useState<{ taskId: string; message: string } | null>(null);

    async function toggleStep(
        task: TaskView,
        stepId: string,
        isCompleted: boolean,
        source: StepCompletionRequest['source'],
    ): Promise<TaskView | null> {
        const wasFinalOpenStep =
            isCompleted &&
            task.steps.filter((step) => !step.isCompleted).length === 1 &&
            task.steps.some((step) => step.id === stepId && !step.isCompleted);
        setStepError(null);
        try {
            const updatedTask = await stepMutation.mutateAsync({
                date,
                isCompleted,
                stepId,
                task,
            });
            if (wasFinalOpenStep && updatedTask.steps.every((step) => step.isCompleted)) {
                setTaskToComplete({ source, task: updatedTask });
            }
            return updatedTask;
        } catch (error) {
            const message =
                error instanceof TaskApiError && error.code === 'VERSION_CONFLICT'
                    ? t('tasks.steps.conflict', { title: task.title })
                    : error instanceof TaskApiError && error.code === 'INVALID_CALENDAR_OPERATION'
                      ? t('tasks.steps.notEditable', { title: task.title })
                      : error instanceof TaskApiError && error.code === 'NOT_FOUND'
                        ? t('tasks.steps.notFound')
                        : error instanceof TaskApiError
                          ? error.message
                          : t('tasks.steps.updateUnavailable');
            setStepError({ message, taskId: task.id });
            return null;
        }
    }

    function toggleBoardStep(task: TaskView, stepId: string, isCompleted: boolean) {
        return toggleStep(task, stepId, isCompleted, 'drag');
    }

    function toggleDetailsStep(task: TaskView, stepId: string, isCompleted: boolean) {
        return toggleStep(task, stepId, isCompleted, 'menu');
    }

    function closeModal() {
        setModal(null);
        moves.clearAnnouncement();
    }

    async function confirmStepCompletion(task: TaskView) {
        const request = taskToComplete;
        if (request === null || request.task.id !== task.id) {
            return;
        }
        await moves.move(request.task, 'completed', request.source);
        setTaskToComplete(null);
    }

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="font-heading m-0 text-4xl tracking-tight text-foreground">
                        {t('tasks.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        <time dateTime={date}>{formatLocalDateLong(date, i18n.language)}</time>
                        {date === today && <span> · {t('common.today')}</span>}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <TaskDateNavigation
                        onSelectDate={(selected) => void navigate(tasksPath(selected))}
                        selectedDate={date}
                        today={today}
                    />
                    <Button onClick={() => setModal({ mode: 'create', status: 'todo' })}>
                        <Plus aria-hidden="true" data-icon="inline-start" />
                        {t('tasks.newTask')}
                    </Button>
                </div>
            </header>

            <p aria-live="polite" className="sr-only" role="status">
                {modal === null ? moves.announcement : ''}
            </p>
            {modal === null && moves.error !== null && (
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
            {modal === null && stepError !== null && (
                <StatusMessage
                    action={
                        <Button onClick={() => setStepError(null)} size="sm" variant="outline">
                            {t('common.dismiss')}
                        </Button>
                    }
                    title={t('tasks.steps.updateFailedTitle')}
                    tone="error"
                >
                    {stepError.message}
                </StatusMessage>
            )}

            {board.isError ? (
                <TaskBoardError
                    isRetrying={board.isFetching}
                    onRetry={() => void board.refetch()}
                />
            ) : (
                <TaskBoard
                    isCompletionDialogOpen={taskToComplete !== null}
                    isStepPending={stepMutation.isPending}
                    onCreateTask={(status) => setModal({ mode: 'create', status })}
                    onMoveTask={(task, status) => moves.move(task, status, 'drag')}
                    onOpenTask={(task) => setModal({ mode: 'task', task })}
                    onToggleStep={toggleBoardStep}
                    pendingTaskIds={moves.pendingTaskIds}
                    selectedDate={date}
                    view={board.data ?? null}
                />
            )}

            <TaskCompletionDialog
                isPending={
                    taskToComplete !== null && moves.pendingTaskIds.has(taskToComplete.task.id)
                }
                onCancel={() => setTaskToComplete(null)}
                onConfirm={(task) => void confirmStepCompletion(task)}
                task={taskToComplete?.task ?? null}
            />

            <TaskModal
                defaultDate={today}
                isStepPending={stepMutation.isPending}
                moves={moves}
                onClearStepError={() => setStepError(null)}
                onClose={closeModal}
                onCreated={closeModal}
                onToggleStep={toggleDetailsStep}
                selectedDate={date}
                stepError={stepError}
                state={modal}
            />
        </div>
    );
}
