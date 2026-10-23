import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { TaskBoard, TaskBoardLoading, useFetchTasksOnDate } from '@/features/tasks/index.ts';
import { StatusMessage } from '@/shared/components/StatusMessage.tsx';
import {
  formatLocalDateLong,
  parseLocalDate,
  todayLocalDate,
  type LocalDate,
} from '@/shared/lib/local-date.ts';
import { TasksTodayRedirect } from './TasksTodayRedirect';

export function TasksPage() {
  const { date = todayLocalDate() } = useParams();
  const selectedDate = parseLocalDate(date);
  
  if (!selectedDate) {
    return <TasksTodayRedirect />;
  }
  return <TasksPageForDate selectedDate={selectedDate} />;
}

type TasksPageForDateProps = {
  selectedDate: LocalDate;
};

function TasksPageForDate({ selectedDate }: TasksPageForDateProps) {
  const { i18n, t } = useTranslation(['tasks', 'common']);
  const { data, isError } = useFetchTasksOnDate(selectedDate);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading m-0 text-4xl tracking-tight text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground">
          <time dateTime={selectedDate}>{formatLocalDateLong(selectedDate, i18n.language)}</time>
        </p>
      </div>

      {data !== undefined ? (
        <TaskBoard input={data} selectedDate={selectedDate} />
      ) : isError ? (
        <StatusMessage title={t('boardError.title')} tone="error">
          {t('boardError.description')}
        </StatusMessage>
      ) : (
        <TaskBoardLoading selectedDate={selectedDate} />
      )}
    </div>
  );
}
