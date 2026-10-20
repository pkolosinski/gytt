import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { TaskBoard, useTaskBoard } from '@/features/tasks/index.ts';
import { formatLocalDateLong, parseLocalDate, todayLocalDate } from '@/shared/lib/local-date.ts';
import { TasksTodayRedirect } from './TasksTodayRedirect';

export function TasksPage() {
  const { i18n, t } = useTranslation(['tasks', 'common']);
  const { date = todayLocalDate() } = useParams();

  const selectedDate = parseLocalDate(date);
  if (selectedDate === null) {
    return <TasksTodayRedirect />;
  }
  
  const board = useTaskBoard(selectedDate);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading m-0 text-4xl tracking-tight text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground">
          <time dateTime={selectedDate}>{formatLocalDateLong(selectedDate, i18n.language)}</time>
        </p>
      </div>

      <TaskBoard selectedDate={selectedDate} view={board.data ?? null} />
    </div>
  );
}
