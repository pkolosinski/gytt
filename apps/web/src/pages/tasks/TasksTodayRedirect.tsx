import { Navigate } from 'react-router';

import { tasksPath } from '@/features/tasks/index.ts';
import { todayLocalDate } from '@/shared/lib/local-date.ts';

export function TasksTodayRedirect() {
    return <Navigate replace to={tasksPath(todayLocalDate())} />;
}
