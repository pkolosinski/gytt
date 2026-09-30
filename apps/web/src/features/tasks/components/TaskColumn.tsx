import { useDroppable } from '@dnd-kit/core';
import { cn } from 'cn';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/shared/generated/shadcn/ui/badge.tsx';
import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import { Skeleton } from '@/shared/generated/shadcn/ui/skeleton.tsx';
import type { LocalDate } from '@/shared/lib/local-date.ts';

import type { TaskBoardItem, TaskStatus, TaskView } from '../models/task.ts';
import { StandardTaskCard, taskCardClassName } from './StandardTaskCard.tsx';
import { TaskStatusIcon } from './TaskStatusIcon.tsx';

const LOADING_CARDS = 2;

interface TaskColumnProps {
    /** The Task being dragged, if any; columns other than its own accept the drop. */
    draggedTask: TaskView | null;
    items: readonly TaskBoardItem[] | null;
    onCreateTask: (status: TaskStatus) => void;
    onOpenTask: (task: TaskView) => void;
    pendingTaskIds: ReadonlySet<string>;
    selectedDate: LocalDate;
    status: TaskStatus;
}

/**
 * One status column of the board: a pinned header cell above a drop zone of Task
 * cards followed by a create action. The heading and create action stay when
 * there are no cards.
 */
export function TaskColumn({
    draggedTask,
    items,
    onCreateTask,
    onOpenTask,
    pendingTaskIds,
    selectedDate,
    status,
}: TaskColumnProps) {
    const { t } = useTranslation();
    const headingId = `task-column-${status}`;
    const label = t(`tasks.status.${status}`);
    const { isOver, setNodeRef } = useDroppable({ id: status });
    const acceptsDrop = draggedTask !== null && draggedTask.status !== status;

    return (
        <section
            aria-labelledby={headingId}
            className={cn(
                'flex min-w-0 snap-start flex-col transition-colors',
                acceptsDrop && 'bg-primary/5',
                acceptsDrop && isOver && 'bg-primary/10 ring-2 ring-primary/40 ring-inset',
            )}
            data-status={status}
            ref={setNodeRef}
        >
            {/* Opaque replica of the board surface so cards scroll beneath the pinned header. */}
            <div className="sticky top-0 z-10 flex h-11 shrink-0 items-center gap-2 border-b bg-background bg-linear-to-r from-muted/50 to-muted/50 px-3">
                <TaskStatusIcon status={status} />
                <h2 className="m-0 truncate text-sm font-medium text-foreground" id={headingId}>
                    {label}
                </h2>
                {items !== null && (
                    <Badge
                        aria-label={t('tasks.column.count', { count: items.length, status: label })}
                        className="ml-auto"
                        variant="secondary"
                    >
                        {items.length}
                    </Badge>
                )}
            </div>
            {items === null && (
                <div aria-hidden="true" className="flex flex-col gap-2 px-2 pt-2">
                    {Array.from({ length: LOADING_CARDS }, (_, index) => (
                        <div className={taskCardClassName} key={index}>
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    ))}
                </div>
            )}
            <ul
                aria-labelledby={headingId}
                className="m-0 flex list-none flex-col gap-2 px-2 pt-2 empty:hidden"
            >
                {items?.map((item) => (
                    <li key={item.task.id}>
                        <StandardTaskCard
                            isPending={pendingTaskIds.has(item.task.id)}
                            onOpen={onOpenTask}
                            selectedDate={selectedDate}
                            task={item.task}
                        />
                    </li>
                ))}
            </ul>
            <div className="p-2">
                <Button
                    aria-label={t('tasks.column.createIn', { status: label })}
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => onCreateTask(status)}
                    variant="ghost"
                >
                    <Plus aria-hidden="true" data-icon="inline-start" />
                    {t('tasks.column.create')}
                </Button>
            </div>
        </section>
    );
}
