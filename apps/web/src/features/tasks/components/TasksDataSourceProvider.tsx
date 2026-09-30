import type { ReactNode } from 'react';

import type { TasksDataSource } from '../api/tasks-data-source.ts';
import { TasksDataSourceContext } from '../hooks/tasks-data-source-context.ts';

interface TasksDataSourceProviderProps {
    children: ReactNode;
    source: TasksDataSource;
}

export function TasksDataSourceProvider({ children, source }: TasksDataSourceProviderProps) {
    return <TasksDataSourceContext value={source}>{children}</TasksDataSourceContext>;
}
