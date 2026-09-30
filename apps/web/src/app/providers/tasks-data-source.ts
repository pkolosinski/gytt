import { createMockTasksDataSource, createSampleTasks } from '@/features/tasks/index.ts';
import { todayLocalDate } from '@/shared/lib/local-date.ts';

/** Mock Tasks data used until the frontend is connected to the OpenAPI client. */
export const tasksDataSource = createMockTasksDataSource({
    delayMs: 150,
    tasks: createSampleTasks(todayLocalDate()),
});
