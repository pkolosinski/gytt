import { useEffect, useRef, useState } from 'react';

import {
    DndContext,
    DragOverlay,
    MouseSensor,
    pointerWithin,
    useSensor,
    useSensors,
    type Announcements,
    type UniqueIdentifier,
} from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import type { LocalDate } from '@/shared/lib/local-date.ts';

import { findTaskInBoard } from '../helpers/task-board.ts';
import {
    TASK_STATUSES,
    type TaskBoardView,
    type TaskStatus,
    type TaskView,
} from '../models/task.ts';
import { TaskCardPreview } from './StandardTaskCard.tsx';
import { TaskColumn } from './TaskColumn.tsx';

interface TaskBoardProps {
    isCompletionDialogOpen: boolean;
    isStepPending: boolean;
    onCreateTask: (status: TaskStatus) => void;
    onMoveTask: (task: TaskView, status: TaskStatus) => Promise<boolean>;
    onOpenTask: (task: TaskView) => void;
    onToggleStep: (
        task: TaskView,
        stepId: string,
        isCompleted: boolean,
    ) => Promise<TaskView | null>;
    pendingTaskIds: ReadonlySet<string>;
    selectedDate: LocalDate;
    /** `null` while the board is loading; the column structure stays in place. */
    view: TaskBoardView | null;
}

type BoardFocusTarget =
    | { taskId: string; type: 'title' }
    | { status: TaskStatus; taskId: string; stepId: string; type: 'step' };

function findStatus(id: UniqueIdentifier | undefined): TaskStatus | null {
    return TASK_STATUSES.find((status) => status === id) ?? null;
}

/**
 * The board is one bordered surface of three card columns. Cards move between
 * columns by mouse drag-and-drop; keyboard and touch users move them from Task
 * details. The board fills the remaining page height and its inner region is
 * the single scroll area for all columns, whose headers stay pinned; on narrow
 * screens it also scrolls horizontally, snapping by column.
 */
export function TaskBoard({
    isCompletionDialogOpen,
    isStepPending,
    onCreateTask,
    onMoveTask,
    onOpenTask,
    onToggleStep,
    pendingTaskIds,
    selectedDate,
    view,
}: TaskBoardProps) {
    const { t } = useTranslation();
    const [draggedTask, setDraggedTask] = useState<TaskView | null>(null);
    const [focusTarget, setFocusTarget] = useState<BoardFocusTarget | null>(null);
    const lastFocusedTarget = useRef<BoardFocusTarget | null>(null);
    // Only mouse dragging is enabled; keyboard and touch users change status in Task details.
    const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 6 } }));

    const titleOf = (id: UniqueIdentifier) =>
        findTaskInBoard(view, id)?.title ?? t('tasks.board.fallbackTitle');
    const labelOf = (id: UniqueIdentifier | undefined) => {
        const status = findStatus(id);
        return status === null ? t('tasks.board.noColumn') : t(`tasks.status.${status}`);
    };
    const announcements: Announcements = {
        onDragCancel: ({ active }) => t('tasks.board.dragCancel', { title: titleOf(active.id) }),
        onDragEnd: ({ active, over }) =>
            over === null
                ? t('tasks.board.dropOutside', { title: titleOf(active.id) })
                : t('tasks.board.dragEnd', { column: labelOf(over.id), title: titleOf(active.id) }),
        onDragOver: ({ active, over }) =>
            t('tasks.board.dragOver', { column: labelOf(over?.id), title: titleOf(active.id) }),
        onDragStart: ({ active }) => t('tasks.board.dragStart', { title: titleOf(active.id) }),
    };

    useEffect(() => {
        if (
            isCompletionDialogOpen ||
            focusTarget === null ||
            focusTarget === lastFocusedTarget.current
        ) {
            return;
        }
        const task = findTaskInBoard(view, focusTarget.taskId);
        if (
            task === null ||
            (focusTarget.type === 'step' && (isStepPending || task.status !== focusTarget.status))
        ) {
            return;
        }
        const card = Array.from(document.querySelectorAll<HTMLElement>('[data-task-id]')).find(
            (candidate) => candidate.dataset.taskId === focusTarget.taskId,
        );
        const target =
            focusTarget.type === 'title'
                ? card?.querySelector<HTMLButtonElement>('[data-task-title]')
                : Array.from(
                      card?.querySelectorAll<HTMLInputElement>('input[data-task-step-id]') ?? [],
                  ).find((step) => step.dataset.taskStepId === focusTarget.stepId);
        if (target == null || target.disabled) {
            return;
        }
        target.focus();
        if (document.activeElement === target) {
            lastFocusedTarget.current = focusTarget;
        }
    }, [focusTarget, isCompletionDialogOpen, isStepPending, view]);

    async function toggleStep(
        task: TaskView,
        stepId: string,
        isCompleted: boolean,
    ): Promise<TaskView | null> {
        const wasFinalOpenStep =
            isCompleted &&
            task.steps.filter((step) => !step.isCompleted).length === 1 &&
            task.steps.some((step) => step.id === stepId && !step.isCompleted);
        const updatedTask = await onToggleStep(task, stepId, isCompleted);
        setFocusTarget(
            wasFinalOpenStep &&
                updatedTask !== null &&
                updatedTask.steps.every((step) => step.isCompleted)
                ? { taskId: task.id, type: 'title' }
                : {
                      status: updatedTask?.status ?? task.status,
                      stepId,
                      taskId: task.id,
                      type: 'step',
                  },
        );
        return updatedTask;
    }

    function requestMove(task: TaskView, status: TaskStatus) {
        if (status === 'completed') {
            setFocusTarget({ taskId: task.id, type: 'title' });
        }
        void onMoveTask(task, status);
    }

    return (
        <>
            <DndContext
                accessibility={{
                    announcements,
                    screenReaderInstructions: {
                        draggable: t('tasks.board.instructions'),
                    },
                }}
                collisionDetection={pointerWithin}
                onDragCancel={() => setDraggedTask(null)}
                onDragEnd={({ active, over }) => {
                    const task = findTaskInBoard(view, active.id);
                    const status = findStatus(over?.id);
                    setDraggedTask(null);
                    if (task !== null && status !== null && status !== task.status) {
                        requestMove(task, status);
                    }
                }}
                onDragStart={({ active }) => setDraggedTask(findTaskInBoard(view, active.id))}
                sensors={sensors}
            >
                <div className="flex min-h-80 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-muted/50">
                    <div
                        aria-busy={view === null}
                        aria-label={t('tasks.board.label')}
                        className="flex min-h-0 flex-1 snap-x snap-mandatory flex-col overflow-auto overscroll-contain outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset lg:overflow-x-hidden"
                        role="region"
                        tabIndex={0}
                    >
                        {/* Grows to fill the board but never shrinks, so all columns share one scroll. */}
                        <div className="grid shrink-0 grow auto-cols-[minmax(15rem,85%)] grid-flow-col divide-x lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-3">
                            {view === null && (
                                <p className="sr-only" role="status">
                                    {t('tasks.board.loading')}
                                </p>
                            )}
                            {TASK_STATUSES.map((status) => (
                                <TaskColumn
                                    draggedTask={draggedTask}
                                    isStepPending={isStepPending}
                                    items={view === null ? null : view[status]}
                                    key={status}
                                    onCreateTask={onCreateTask}
                                    onOpenTask={onOpenTask}
                                    onToggleStep={toggleStep}
                                    pendingTaskIds={pendingTaskIds}
                                    selectedDate={selectedDate}
                                    status={status}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                {createPortal(
                    <DragOverlay dropAnimation={null}>
                        {draggedTask === null ? null : (
                            <TaskCardPreview selectedDate={selectedDate} task={draggedTask} />
                        )}
                    </DragOverlay>,
                    document.body,
                )}
            </DndContext>
        </>
    );
}
