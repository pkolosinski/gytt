import { createContext, useContext } from 'react';

import type { TasksDataSource } from '../api/tasks-data-source.ts';

export const TasksDataSourceContext = createContext<TasksDataSource | null>(null);

export function useTasksDataSource(): TasksDataSource {
    const source = useContext(TasksDataSourceContext);
    if (source === null) {
        throw new Error('useTasksDataSource must be used within a TasksDataSourceProvider.');
    }
    return source;
}
