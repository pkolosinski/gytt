import { useTranslation } from 'react-i18next';

import { TaskBoard, TaskBoardLoading, useFetchTasksFromDate } from '@/features/tasks/index.ts';
import { StatusMessage } from '@/shared/components/StatusMessage.tsx';
import { useTasksSelectedDate } from './TasksLayout';

export function TasksPage() {
  const { t } = useTranslation('tasks');
  const selectedDate = useTasksSelectedDate();
  const { data, status } = useFetchTasksFromDate(selectedDate);

  if (status === 'error') {
    return (
      <StatusMessage title={t('boardError.title')} tone="error">
        {t('boardError.description')}
      </StatusMessage>
    );
  }
  if (status === 'pending') {
    return <TaskBoardLoading selectedDate={selectedDate} />;
  }

  return <TaskBoard input={data!} selectedDate={selectedDate} />;
}
