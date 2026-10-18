import { useParams } from 'react-router';
import { todayLocalDate } from '@/shared/lib/local-date.ts';

import { parseLocalDate } from '@/shared/lib/local-date.ts';
import { TasksPage } from './TasksPage.tsx';
import { TasksTodayRedirect } from './TasksTodayRedirect.tsx';

export function TasksDatePage() {
  const { date = todayLocalDate() } = useParams();
  const localDate = parseLocalDate(date);

  if (!localDate) {
    return <TasksTodayRedirect />;
  }
  return <TasksPage date={localDate} />;
}
