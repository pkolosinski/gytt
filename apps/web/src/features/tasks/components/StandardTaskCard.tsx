import { useTranslation } from 'react-i18next';

import { cn } from 'cn';
import { CalendarClock } from 'lucide-react';

import { formatLocalDateShort, type LocalDate } from '@/shared/lib/local-date.ts';
import type { TaskListItem, TaskStatus } from '../models/task.ts';
import { TaskStatusSelect } from './TaskStatusSelect.tsx';
import { TaskStepList } from './TaskStepList.tsx';

export const taskCardClassName =
  'flex flex-col gap-2 rounded-lg bg-background p-3 text-left text-sm shadow-xs ring-1 ring-foreground/10';

interface StandardTaskCardProps {
  selectedDate: LocalDate;
  task: TaskListItem;
  onOpen?: () => void;
  onMove?: (status: TaskStatus) => void;
  onToggleStep?: (index: number, completed: boolean) => void;
  stepsDisabled?: boolean;
}

export function StandardTaskCard({
  selectedDate,
  task,
  onOpen,
  onMove,
  onToggleStep,
  stepsDisabled,
}: StandardTaskCardProps) {
  return (
    <article
      className={cn(taskCardClassName, 'relative transition-colors hover:bg-accent/50')}
      data-task-id={task.id}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="m-0 text-base font-medium text-foreground">
          <TaskTitle onOpen={onOpen} task={task} />
        </h3>
        <TaskCardDetails task={task} />
        <TaskStepList
          disabled={stepsDisabled || task.status === 'completed'}
          onToggle={onToggleStep}
          steps={task.steps}
        />
        <TaskCardFooter onMove={onMove} selectedDate={selectedDate} task={task} />
      </div>
    </article>
  );
}

interface TaskTitleProps {
  task: TaskListItem;
  onOpen?: () => void;
}

/** The title is the card's button; its pseudo-element stretches the click target over the card. */
function TaskTitle({ task, onOpen }: TaskTitleProps) {
  return (
    <button
      className={cn(
        'line-clamp-1 w-full cursor-pointer text-left break-words outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-3 focus-visible:after:ring-ring/50',
        task.status === 'completed' && 'text-muted-foreground',
      )}
      onClick={onOpen}
      type="button"
    >
      {task.title}
    </button>
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

interface TaskCardFooterProps {
  selectedDate: LocalDate;
  task: TaskListItem;
  onMove?: (status: TaskStatus) => void;
}

/** The start date and the status, which stays editable above the card's click target. */
function TaskCardFooter({ selectedDate, task, onMove }: TaskCardFooterProps) {
  const { t } = useTranslation('tasks');

  return (
    <div className="flex items-center gap-2 empty:hidden">
      <TaskCardSince selectedDate={selectedDate} task={task} />
      {onMove && (
        <TaskStatusSelect
          className="relative z-10 ml-auto"
          label={t('statusSelect.label', { title: task.title })}
          onChange={onMove}
          value={task.status}
        />
      )}
    </div>
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
