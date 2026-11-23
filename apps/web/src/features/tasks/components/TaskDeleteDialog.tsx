import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/generated/shadcn/ui/dialog.tsx';
import { useDeleteTask } from '../hooks/useDeleteTask.ts';
import type { TaskListItem } from '../models/task.ts';

interface Props {
  /** The Task to delete; `null` keeps the dialog closed. */
  task: TaskListItem | null;
  onClose: () => void;
}

/** Asks for confirmation before permanently deleting a Task. */
export function TaskDeleteDialog({ task, onClose }: Props) {
  const { t } = useTranslation(['tasks', 'common']);
  const { mutate, isPending, isError, reset } = useDeleteTask();
  // Keep showing the last Task while the dialog animates closed.
  const [shownTask, setShownTask] = useState(task);
  if (task !== null && task !== shownTask) {
    setShownTask(task);
  }

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog onOpenChange={(open) => !open && close()} open={task !== null}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('tasks:modal.deleteTitle')}</DialogTitle>
          <DialogDescription className="break-words">
            {t('tasks:modal.deleteDescription', { title: shownTask?.title })}
          </DialogDescription>
        </DialogHeader>
        {isError && (
          <p className="m-0 text-sm text-destructive" role="alert">
            {t('tasks:modal.deleteUnavailable')}
          </p>
        )}
        <DialogFooter>
          <Button disabled={isPending} onClick={close} type="button" variant="outline">
            {t('common:cancel')}
          </Button>
          <Button
            disabled={isPending}
            onClick={() => shownTask && mutate(shownTask.id, { onSuccess: close })}
            type="button"
            variant="destructive"
          >
            {isPending ? t('tasks:modal.deleting') : t('tasks:modal.deleteTask')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
