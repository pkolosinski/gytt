import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { moveTask } from '../helpers/move-task.ts';
import { useUpdateTask } from '../hooks/useUpdateTask.ts';
import { toTaskFormValues } from '../models/task-form.ts';
import type { TaskListItem } from '../models/task.ts';
import { TaskFormDialog } from './TaskFormDialog.tsx';

interface Props {
  /** The Task to edit; `null` keeps the dialog closed. */
  task: TaskListItem | null;
  onClose: () => void;
}

export function TaskEditDialog({ task, onClose }: Props) {
  const { t } = useTranslation('tasks');
  const { mutate, isPending, isError, reset } = useUpdateTask();
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
    shownTask && (
      <TaskFormDialog
        description={t('modal.editDescription')}
        heading={t('modal.editTitle')}
        initialValues={toTaskFormValues(shownTask)}
        isError={isError}
        isPending={isPending}
        onClose={close}
        onSubmit={({ title, description, status, steps = [] }) =>
          mutate(
            {
              id: shownTask.id,
              patch: {
                title,
                description,
                steps,
                ...moveTask({ ...shownTask, steps }, status),
              },
            },
            { onSuccess: close },
          )
        }
        open={task !== null}
        submitLabel={t('editor.save')}
      />
    )
  );
}
