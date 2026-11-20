import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { LocalDate } from '@/shared/lib/local-date.ts';
import { TASK_STATUSES, type TasksFromDate } from '../models/task.ts';
import { TaskColumn } from './TaskColumn.tsx';

type Props = {
  selectedDate: LocalDate;
  input: TasksFromDate;
};

export function TaskBoard({ selectedDate, input }: Props) {
  return (
    <TaskBoardFrame busy={false}>
      {TASK_STATUSES.map((status) => (
        <TaskColumn
          key={status}
          items={input[status]}
          selectedDate={selectedDate}
          status={status}
        />
      ))}
    </TaskBoardFrame>
  );
}

type TaskBoardLoadingProps = {
  selectedDate: LocalDate;
};

type TaskBoardFrameProps = {
  busy: boolean;
  children: ReactNode;
};

export function TaskBoardLoading({ selectedDate }: TaskBoardLoadingProps) {
  return (
    <TaskBoardFrame busy>
      {TASK_STATUSES.map((status) => (
        <TaskColumn key={status} items={null} selectedDate={selectedDate} status={status} />
      ))}
    </TaskBoardFrame>
  );
}

function TaskBoardFrame({ busy, children }: TaskBoardFrameProps) {
  const { t } = useTranslation('tasks');

  return (
    <div className="flex min-h-80 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-muted/50">
      <div
        aria-busy={busy}
        aria-label={t(busy ? 'board.loading' : 'board.label')}
        className="flex min-h-0 flex-1 snap-x snap-mandatory flex-col overflow-auto overscroll-contain outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset lg:overflow-x-hidden"
        role="region"
        tabIndex={0}
      >
        {/* Grows to fill the board but never shrinks, so all columns share one scroll. */}
        <div className="grid min-h-full w-full shrink-0 grow auto-cols-[100%] grid-flow-col divide-x lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-3">
          {children}
        </div>
      </div>
    </div>
  );
}
