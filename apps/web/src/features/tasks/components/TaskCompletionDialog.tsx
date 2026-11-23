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
import type { TaskListItem } from '../models/task.ts';

interface Props {
  /** The Task whose Steps are all done; `null` keeps the dialog closed. */
  task: TaskListItem | null;
  onConfirm: (task: TaskListItem) => void;
  onClose: () => void;
}

/** Asks whether a Task with all Steps done should move to Completed. */
export function TaskCompletionDialog({ task, onConfirm, onClose }: Props) {
  const { t } = useTranslation('tasks');
  // Keep showing the last Task while the dialog animates closed.
  const [shownTask, setShownTask] = useState(task);
  if (task !== null && task !== shownTask) {
    setShownTask(task);
  }

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={task !== null}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="break-words">
            {t('completion.title', { title: shownTask?.title })}
          </DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} type="button" variant="outline">
            {t('completion.no')}
          </Button>
          <Button onClick={() => shownTask && onConfirm(shownTask)} type="button">
            {t('completion.yes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
