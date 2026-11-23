import { useTranslation } from 'react-i18next';

import type { LocalDate } from '@/shared/lib/local-date.ts';
import { useCreateTask } from '../hooks/useCreateTask.ts';
import type { TaskFormValues } from '../models/task-form.ts';
import type { TaskStatus } from '../models/task.ts';
import { TaskFormDialog } from './TaskFormDialog.tsx';

const emptyValues = (status: TaskStatus): TaskFormValues => ({
  title: '',
  description: '',
  status,
  steps: [],
});

interface Props {
  selectedDate: LocalDate;
  /** The status the new Task starts in; `null` keeps the dialog closed. */
  status: TaskStatus | null;
  onClose: () => void;
}

export function TaskCreateDialog({ selectedDate, status, onClose }: Props) {
  const { t } = useTranslation('tasks');
  const { mutate, isPending, isError, reset } = useCreateTask();

  const close = () => {
    reset();
    onClose();
  };

  return (
    <TaskFormDialog
      description={t('modal.createDescription')}
      heading={t('modal.createTitle')}
      initialValues={emptyValues(status ?? 'todo')}
      isError={isError}
      isPending={isPending}
      onClose={close}
      onSubmit={(fields) => mutate({ ...fields, createdOn: selectedDate }, { onSuccess: close })}
      open={status !== null}
      submitLabel={t('editor.create')}
    />
  );
}
