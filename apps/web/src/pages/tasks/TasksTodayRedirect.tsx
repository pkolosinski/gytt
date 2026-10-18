import { Navigate } from 'react-router';

import { todayLocalDate } from '@/shared/lib/local-date.ts';

export function TasksTodayRedirect() {
  return <Navigate replace to={`/tasks/${todayLocalDate()}`} />;
}
