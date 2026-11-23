import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { cn } from 'cn';
import { PlusIcon } from 'lucide-react';

import { Badge } from '@/shared/generated/shadcn/ui/badge.tsx';
import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import { Skeleton } from '@/shared/generated/shadcn/ui/skeleton.tsx';
import type { LocalDate } from '@/shared/lib/local-date.ts';
import type { TaskListItem, TaskStatus } from '../models/task.ts';
import { StandardTaskCard, taskCardClassName } from './StandardTaskCard.tsx';
import { TaskStatusIcon } from './TaskStatusIcon.tsx';

const LOADING_CARDS = 2;

interface Props {
  selectedDate: LocalDate;
  status: TaskStatus;
  items: readonly TaskListItem[] | null;
  /** Whether cards can be dragged out of this column and dropped onto columns. */
  draggable?: boolean;
  onCreate?: () => void;
  onMoveTask?: (task: TaskListItem, status: TaskStatus) => void;
  onOpenTask?: (task: TaskListItem) => void;
  onToggleStep?: (task: TaskListItem, index: number, completed: boolean) => void;
  stepsDisabled?: boolean;
}

/**
 * One status column of the board, with a pinned header and task cards.
 */
export function TaskColumn({
  selectedDate,
  status,
  items,
  draggable = false,
  onCreate,
  onMoveTask,
  onOpenTask,
  onToggleStep,
  stepsDisabled,
}: Props) {
  const { t } = useTranslation('tasks');
  const headingId = `task-column-${status}`;
  const label = t(`status.${status}`);
  const { isOver, setNodeRef } = useDroppable({ disabled: !draggable, id: status });

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'flex min-h-full min-w-0 snap-start snap-always flex-col transition-colors',
        isOver && 'bg-primary/5',
      )}
      data-status={status}
      ref={setNodeRef}
    >
      <div className="sticky top-0 z-10 flex h-11 shrink-0 items-center gap-2 border-b bg-background bg-linear-to-r from-muted/50 to-muted/50 px-3">
        <TaskStatusIcon status={status} />
        <h2 className="m-0 truncate text-sm font-medium text-foreground" id={headingId}>
          {label}
        </h2>
        {items !== null && (
          <Badge
            aria-label={t('column.count', { count: items.length, status: label })}
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
          <DraggableTaskItem disabled={!draggable} id={item.id} key={item.id}>
            <StandardTaskCard
              onMove={onMoveTask && ((target) => onMoveTask(item, target))}
              onOpen={() => onOpenTask?.(item)}
              onToggleStep={(index, completed) => onToggleStep?.(item, index, completed)}
              stepsDisabled={stepsDisabled}
              selectedDate={selectedDate}
              task={item}
            />
          </DraggableTaskItem>
        ))}
      </ul>
      {items !== null && (
        <div className="p-2">
          <Button
            aria-label={t('column.createIn', { status: label })}
            className="w-full justify-start"
            onClick={onCreate}
            variant="ghost"
          >
            <PlusIcon aria-hidden="true" />
            {t('newTask')}
          </Button>
        </div>
      )}
    </section>
  );
}

interface DraggableTaskItemProps {
  id: string;
  disabled: boolean;
  children: ReactNode;
}

function DraggableTaskItem({ id, disabled, children }: DraggableTaskItemProps) {
  const { isDragging, listeners, setNodeRef } = useDraggable({ disabled, id });

  return (
    <li className={cn(isDragging && 'opacity-40')} ref={setNodeRef} {...listeners}>
      {children}
    </li>
  );
}
