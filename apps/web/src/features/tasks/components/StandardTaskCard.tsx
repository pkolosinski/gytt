import { useDraggable } from '@dnd-kit/core';
import { cn } from 'cn';
import { CalendarClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatLocalDateShort, type LocalDate } from '@/shared/lib/local-date.ts';

import type { TaskView } from '../models/task.ts';
import { TaskStepList } from './TaskStepList.tsx';

export const taskCardClassName =
    'flex min-h-28 flex-col gap-2 rounded-lg bg-background p-3 text-left text-sm shadow-xs ring-1 ring-foreground/10';

interface StandardTaskCardProps {
    isPending: boolean;
    onOpen: (task: TaskView) => void;
    onToggleStep: (
        task: TaskView,
        stepId: string,
        isCompleted: boolean,
    ) => Promise<TaskView | null>;
    selectedDate: LocalDate;
    task: TaskView;
}

/**
 * The card opens its Task details and can be dragged; Step checkboxes remain
 * independently interactive.
 */
export function StandardTaskCard({
    isPending,
    onOpen,
    onToggleStep,
    selectedDate,
    task,
}: StandardTaskCardProps) {
    const { isDragging, listeners, setActivatorNodeRef, setNodeRef } = useDraggable({
        disabled: isPending,
        id: task.id,
    });

    return (
        <article
            aria-busy={isPending}
            className={cn(
                taskCardClassName,
                'relative transition-[box-shadow,opacity] hover:shadow-sm hover:ring-foreground/20',
                isDragging && 'opacity-40',
                isPending && 'opacity-70',
            )}
            data-task-id={task.id}
            ref={setNodeRef}
        >
            <button
                aria-label={task.title}
                className="absolute inset-0 z-0 cursor-grab rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
                {...listeners}
                data-task-title
                onClick={() => onOpen(task)}
                ref={setActivatorNodeRef}
                type="button"
            />
            <div className="pointer-events-none relative z-10 flex min-w-0 flex-col gap-2">
                <span
                    aria-hidden="true"
                    className="text-base font-medium text-foreground"
                    data-task-title-text
                >
                    <TaskTitle task={task} />
                </span>
                <TaskCardDetails task={task} />
                <TaskStepList isPending={isPending} onToggleStep={onToggleStep} task={task} />
                <TaskCardSince selectedDate={selectedDate} task={task} />
            </div>
        </article>
    );
}

interface TaskCardPreviewProps {
    selectedDate: LocalDate;
    task: TaskView;
}

/** The non-interactive copy of a card that follows the pointer while dragging. */
export function TaskCardPreview({ selectedDate, task }: TaskCardPreviewProps) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                taskCardClassName,
                'rotate-2 cursor-grabbing shadow-lg ring-2 ring-primary/40',
            )}
        >
            <span className="font-medium break-words text-foreground">
                <TaskTitle task={task} />
            </span>
            <TaskCardDetails task={task} />
            <TaskStepList isPending task={task} />
            <TaskCardSince selectedDate={selectedDate} task={task} />
        </div>
    );
}

interface TaskTitleProps {
    task: TaskView;
}

function TaskTitle({ task }: TaskTitleProps) {
    return (
        <span
            className={cn(
                'line-clamp-1 break-words',
                task.status === 'completed' && 'text-muted-foreground',
            )}
        >
            {task.title}
        </span>
    );
}

interface TaskCardDetailsProps {
    task: TaskView;
}

function TaskCardDetails({ task }: TaskCardDetailsProps) {
    return (
        <>
            {task.details !== null && (
                <p className="m-0 line-clamp-2 text-sm break-words whitespace-pre-line text-muted-foreground">
                    {task.details}
                </p>
            )}
        </>
    );
}

interface TaskCardSinceProps {
    selectedDate: LocalDate;
    task: TaskView;
}

function TaskCardSince({ selectedDate, task }: TaskCardSinceProps) {
    const { i18n, t } = useTranslation();
    const isCarriedForward = task.startDate < selectedDate;
    if (!isCarriedForward) {
        return null;
    }
    return (
        <span className="inline-flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
            <CalendarClock aria-hidden="true" className="size-3.5" />
            {t('tasks.card.since', {
                date: formatLocalDateShort(task.startDate, i18n.language),
            })}
        </span>
    );
}
