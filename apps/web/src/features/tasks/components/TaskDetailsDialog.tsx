import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/generated/shadcn/ui/dialog.tsx';
import type { TaskListItem, TaskStatus } from '../models/task.ts';
import { TaskStatusSelect } from './TaskStatusSelect.tsx';
import { TaskStepList } from './TaskStepList.tsx';

interface Props {
  /** The Task to show; `null` keeps the dialog closed. */
  task: TaskListItem | null;
  onClose: () => void;
  onToggleStep: (task: TaskListItem, index: number, completed: boolean) => void;
  onMove: (task: TaskListItem, status: TaskStatus) => void;
  onEdit: (task: TaskListItem) => void;
  onDelete: (task: TaskListItem) => void;
  stepsDisabled: boolean;
}

export function TaskDetailsDialog({
  task,
  onClose,
  onToggleStep,
  onMove,
  onEdit,
  onDelete,
  stepsDisabled,
}: Props) {
  // Keep showing the last Task while the dialog animates closed.
  const [shownTask, setShownTask] = useState(task);
  if (task !== null && task !== shownTask) {
    setShownTask(task);
  }

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={task !== null}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        {shownTask !== null && (
          <TaskDetails
            onDelete={onDelete}
            onEdit={onEdit}
            onMove={onMove}
            onToggleStep={onToggleStep}
            stepsDisabled={stepsDisabled}
            task={shownTask}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface DetailsProps {
  task: TaskListItem;
  onToggleStep: (task: TaskListItem, index: number, completed: boolean) => void;
  onMove: (task: TaskListItem, status: TaskStatus) => void;
  onEdit: (task: TaskListItem) => void;
  onDelete: (task: TaskListItem) => void;
  stepsDisabled: boolean;
}

function TaskDetails({
  task,
  onToggleStep,
  onMove,
  onEdit,
  onDelete,
  stepsDisabled,
}: DetailsProps) {
  const { t } = useTranslation(['tasks', 'common']);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="break-words">{task.title}</DialogTitle>
      </DialogHeader>
      {task.description && (
        <p className="m-0 break-words whitespace-pre-line text-muted-foreground">
          {task.description}
        </p>
      )}
      <TaskStepList
        disabled={stepsDisabled || task.status === 'completed'}
        onToggle={(index, completed) => onToggleStep(task, index, completed)}
        steps={task.steps}
      />
      <DialogFooter>
        <TaskStatusSelect
          className="w-full sm:mr-auto sm:w-fit"
          label={t('tasks:statusSelect.field')}
          onChange={(status) => onMove(task, status)}
          value={task.status}
        />
        <Button onClick={() => onDelete(task)} type="button" variant="destructive">
          {t('common:delete')}
        </Button>
        <Button onClick={() => onEdit(task)} type="button" variant="outline">
          {t('common:edit')}
        </Button>
      </DialogFooter>
    </>
  );
}
