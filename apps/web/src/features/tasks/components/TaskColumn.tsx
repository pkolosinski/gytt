import { useTranslation } from 'react-i18next';

import { Badge } from '@/shared/generated/shadcn/ui/badge.tsx';
import { Skeleton } from '@/shared/generated/shadcn/ui/skeleton.tsx';
import type { LocalDate } from '@/shared/lib/local-date.ts';
import type { TaskListItem, TaskStatus } from '../models/task.ts';
import { StandardTaskCard, taskCardClassName } from './StandardTaskCard.tsx';
import { TaskStatusIcon } from './TaskStatusIcon.tsx';

const LOADING_CARDS = 2;

interface TaskColumnProps {
  items: readonly TaskListItem[] | null;
  selectedDate: LocalDate;
  status: TaskStatus;
}

/**
 * One status column of the read-only board, with a pinned header and task cards.
 */
export function TaskColumn({ items, selectedDate, status }: TaskColumnProps) {
  const { t } = useTranslation('tasks');
  const headingId = `task-column-${status}`;
  const label = t(`status.${status}`);

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-h-full min-w-0 snap-start flex-col"
      data-status={status}
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
          <li key={item.id}>
            <StandardTaskCard selectedDate={selectedDate} task={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
