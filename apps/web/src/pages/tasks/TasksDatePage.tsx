import { useParams } from 'react-router';

import { TaskDateNotFound } from '@/features/tasks/index.ts';
import { parseLocalDate } from '@/shared/lib/local-date.ts';

import { TasksPage } from './TasksPage.tsx';

export function TasksDatePage() {
    const { date = '' } = useParams();
    const localDate = parseLocalDate(date);

    if (localDate === null) {
        return <TaskDateNotFound value={date} />;
    }
    return <TasksPage date={localDate} />;
}
