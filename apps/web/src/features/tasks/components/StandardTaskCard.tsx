import { useTranslation } from 'react-i18next';

import { cn } from 'cn';
import { CalendarClock } from 'lucide-react';

import { formatLocalDateShort, type LocalDate } from '@/shared/lib/local-date.ts';
import type { TaskListItem } from '../models/task.ts';
import { TaskStepList } from './TaskStepList.tsx';

export const taskCardClassName =
  'flex flex-col gap-2 rounded-lg bg-background p-3 text-left text-sm shadow-xs ring-1 ring-foreground/10';

interface StandardTaskCardProps {
  selectedDate: LocalDate;
  task: TaskListItem;
}

/** A non-interactive card showing the Task's board information and Steps. */
export function StandardTaskCard({ selectedDate, task }: StandardTaskCardProps) {
  return (
    <article className={taskCardClassName} data-task-id={task.id}>
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="m-0 text-base font-medium text-foreground">
          <TaskTitle task={task} />
        </h3>
        <TaskCardDetails task={task} />
        <TaskStepList steps={task.steps} />
        <TaskCardSince selectedDate={selectedDate} task={task} />
      </div>
    </article>
  );
}

interface TaskTitleProps {
  task: TaskListItem;
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
  task: TaskListItem;
}

function TaskCardDetails({ task }: TaskCardDetailsProps) {
  return (
    <>
      {task.description && (
        <p className="m-0 line-clamp-2 text-sm break-words whitespace-pre-line text-muted-foreground">
          {task.description}
        </p>
      )}
    </>
  );
}

interface TaskCardSinceProps {
  selectedDate: LocalDate;
  task: TaskListItem;
}

function TaskCardSince({ selectedDate, task }: TaskCardSinceProps) {
  const { i18n, t } = useTranslation('tasks');
  if (task.createdOn === undefined || task.createdOn >= selectedDate) {
    return null;
  }
  return (
    <span className="inline-flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
      <CalendarClock aria-hidden="true" className="size-3.5" />
      {t('card.since', {
        date: formatLocalDateShort(task.createdOn, i18n.language),
      })}
    </span>
  );
}
