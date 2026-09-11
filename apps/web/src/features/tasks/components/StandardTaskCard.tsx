import { useId } from 'react';

import { useDraggable } from '@dnd-kit/core';
import { cn } from 'cn';
import { CalendarClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatLocalDateShort, type LocalDate } from '@/shared/lib/local-date.ts';

import type { TaskView } from '../models/task.ts';

export const taskCardClassName =
    'flex h-28 flex-col gap-1 rounded-lg bg-background p-2 text-left text-sm shadow-xs ring-1 ring-foreground/10';

interface StandardTaskCardProps {
    isPending: boolean;
    onOpen: (task: TaskView) => void;
    selectedDate: LocalDate;
    task: TaskView;
}

/**
 * A standard Task card. Its title opens the Task details, and the card can be
 * dragged with a mouse to move it between columns.
 */
export function StandardTaskCard({ isPending, onOpen, selectedDate, task }: StandardTaskCardProps) {
    const titleId = useId();
    const { isDragging, listeners, setNodeRef } = useDraggable({
        disabled: isPending,
        id: task.id,
    });

    return (
        <article
            aria-busy={isPending}
            aria-labelledby={titleId}
            className={cn(
                taskCardClassName,
                'relative transition-[box-shadow,opacity] hover:shadow-sm hover:ring-foreground/20',
                isDragging && 'opacity-40',
                isPending && 'opacity-70',
            )}
            data-task-id={task.id}
            ref={setNodeRef}
            {...listeners}
        >
            <button
                className="cursor-pointer text-left text-base font-medium text-foreground outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
                id={titleId}
                onClick={() => onOpen(task)}
                type="button"
            >
                <TaskTitle task={task} />
            </button>
            <TaskCardDetails selectedDate={selectedDate} task={task} />
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
            <TaskCardDetails selectedDate={selectedDate} task={task} />
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
    selectedDate: LocalDate;
    task: TaskView;
}

function TaskCardDetails({ selectedDate, task }: TaskCardDetailsProps) {
    const { i18n, t } = useTranslation();
    const isCarriedForward = task.startDate < selectedDate;

    return (
        <>
            {task.details !== null && (
                <p className="m-0 line-clamp-2 text-sm break-words whitespace-pre-line text-muted-foreground">
                    {task.details}
                </p>
            )}
            {isCarriedForward && (
                <span className="inline-flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
                    <CalendarClock aria-hidden="true" className="size-3.5" />
                    {t('tasks.card.since', {
                        date: formatLocalDateShort(task.startDate, i18n.language),
                    })}
                </span>
            )}
        </>
    );
}
