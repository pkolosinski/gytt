import { useTranslation } from 'react-i18next';
import { Outlet, useOutletContext, useParams } from 'react-router';

import { formatLocalDateFull, parseLocalDate, type LocalDate } from '@/shared/lib/local-date.ts';
import { TasksTodayRedirect } from './TasksTodayRedirect';

type TasksLayoutContext = { selectedDate: LocalDate };

export function useTasksSelectedDate() {
  return useOutletContext<TasksLayoutContext>().selectedDate;
}

export function TasksLayout() {
  const { date } = useParams();
  const selectedDate = date ? parseLocalDate(date) : undefined;

  if (!selectedDate) {
    return <TasksTodayRedirect />;
  }
  return <TasksLayoutForDate selectedDate={selectedDate} />;
}

function TasksLayoutForDate({ selectedDate }: TasksLayoutContext) {
  const { i18n, t } = useTranslation('tasks');

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading m-0 text-4xl tracking-tight text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground">
          <time dateTime={selectedDate}>{formatLocalDateFull(selectedDate, i18n.language)}</time>
        </p>
      </div>
      <Outlet context={{ selectedDate } satisfies TasksLayoutContext} />
    </div>
  );
}
