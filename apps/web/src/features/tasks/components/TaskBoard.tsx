import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { DndContext, DragOverlay } from '@dnd-kit/core';
import { PlusIcon } from 'lucide-react';

import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery.ts';
import type { LocalDate } from '@/shared/lib/local-date.ts';
import { moveTask } from '../helpers/move-task.ts';
import { toggleStep } from '../helpers/toggle-step.ts';
import { useTaskDrag } from '../hooks/useTaskDrag.ts';
import { useUpdateTask } from '../hooks/useUpdateTask.ts';
import {
  TASK_STATUSES,
  type TaskListItem,
  type TasksFromDate,
  type TaskStatus,
} from '../models/task.ts';
import { StandardTaskCard } from './StandardTaskCard.tsx';
import { TaskColumn } from './TaskColumn.tsx';
import { TaskCompletionDialog } from './TaskCompletionDialog.tsx';
import { TaskCreateDialog } from './TaskCreateDialog.tsx';
import { TaskDeleteDialog } from './TaskDeleteDialog.tsx';
import { TaskDetailsDialog } from './TaskDetailsDialog.tsx';
import { TaskEditDialog } from './TaskEditDialog.tsx';

/** Matches Tailwind's `lg`, where the columns sit side by side and cards can be dragged. */
const DRAG_MEDIA_QUERY = '(min-width: 64rem)';

type Props = {
  selectedDate: LocalDate;
  input: TasksFromDate;
};

export function TaskBoard({ selectedDate, input }: Props) {
  const { t } = useTranslation('tasks');
  const [creatingStatus, setCreatingStatus] = useState<TaskStatus | null>(null);
  const [viewedTaskId, setViewedTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [completionTaskId, setCompletionTaskId] = useState<string | null>(null);
  const { mutate, isPending } = useUpdateTask();
  const allTasks = TASK_STATUSES.flatMap((status) => input[status]);
  const findTask = (id: string | null) => allTasks.find((task) => task.id === id) ?? null;
  const canDrag = useMediaQuery(DRAG_MEDIA_QUERY);

  const handleMoveTask = (task: TaskListItem, status: TaskStatus) => {
    const patch = moveTask(task, status);
    if (patch !== null) {
      mutate({ id: task.id, patch });
    }
  };
  const { dndContextProps, draggedTask } = useTaskDrag({
    findTask,
    onMove: handleMoveTask,
  });

  const handleToggleStep = (task: TaskListItem, index: number, completed: boolean) => {
    const { patch, completesAllSteps } = toggleStep(task, index, completed);
    mutate(
      { id: task.id, patch },
      {
        onSuccess: () => {
          if (completesAllSteps) {
            setViewedTaskId(null);
            setCompletionTaskId(task.id);
          }
        },
      },
    );
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setCreatingStatus('todo')}>
          <PlusIcon aria-hidden="true" />
          {t('newTask')}
        </Button>
      </div>
      <DndContext {...dndContextProps}>
        <TaskBoardFrame busy={false}>
          {TASK_STATUSES.map((status) => (
            <TaskColumn
              draggable={canDrag}
              items={input[status]}
              key={status}
              onCreate={() => setCreatingStatus(status)}
              onMoveTask={handleMoveTask}
              onOpenTask={(task) => setViewedTaskId(task.id)}
              onToggleStep={handleToggleStep}
              stepsDisabled={isPending}
              selectedDate={selectedDate}
              status={status}
            />
          ))}
        </TaskBoardFrame>
        <DragOverlay dropAnimation={null}>
          {draggedTask && (
            <div className="cursor-grabbing rounded-lg shadow-lg">
              <StandardTaskCard selectedDate={selectedDate} task={draggedTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
      <TaskCreateDialog
        status={creatingStatus}
        onClose={() => setCreatingStatus(null)}
        selectedDate={selectedDate}
      />
      <TaskDetailsDialog
        onClose={() => setViewedTaskId(null)}
        onDelete={(task) => {
          setViewedTaskId(null);
          setDeletingTaskId(task.id);
        }}
        onEdit={(task) => {
          setViewedTaskId(null);
          setEditingTaskId(task.id);
        }}
        onMove={handleMoveTask}
        onToggleStep={handleToggleStep}
        stepsDisabled={isPending}
        task={findTask(viewedTaskId)}
      />
      <TaskEditDialog onClose={() => setEditingTaskId(null)} task={findTask(editingTaskId)} />
      <TaskDeleteDialog onClose={() => setDeletingTaskId(null)} task={findTask(deletingTaskId)} />
      <TaskCompletionDialog
        onClose={() => setCompletionTaskId(null)}
        onConfirm={(task) => {
          mutate({ id: task.id, patch: { status: 'completed' } });
          setCompletionTaskId(null);
        }}
        task={findTask(completionTaskId)}
      />
    </>
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
