import { addDays, type LocalDate } from '@/shared/lib/local-date.ts';
import type { TaskListItem } from '../models/task.ts';
import type { TasksApi } from './tasks-api.ts';

type MockTasksApiOptions = {
  tasks?: readonly TaskListItem[];
  delayMs?: number;
};

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function copyTask(task: TaskListItem): TaskListItem {
  return task.steps === undefined
    ? { ...task }
    : { ...task, steps: task.steps.map((step) => ({ ...step })) };
}

/** An in-memory, read-only stand-in for the Tasks list endpoint. */
export function createMockTasksApi({
  tasks = [],
  delayMs = 0,
}: MockTasksApiOptions = {}): TasksApi {
  const items = tasks.map(copyTask);

  return {
    async listTasks(date) {
      await wait(delayMs);
      return items
        .filter((task) => task.createdOn === undefined || task.createdOn <= date)
        .map(copyTask);
    },
  };
}

/** Sample Tasks relative to the device Today for the read-only board. */
export function createSampleTasks(today: LocalDate): TaskListItem[] {
  return [
    {
      createdOn: addDays(today, -2),
      description: 'Bring proof of address.',
      id: '6f1c2d4e-8a3b-4c5d-9e6f-7a8b9c0d1e2f',
      status: 'todo',
      steps: [
        { completed: true, name: 'Find proof of address' },
        { completed: false, name: 'Visit the library' },
      ],
      title: 'Renew library card',
    },
    {
      createdOn: today,
      id: '0b9e8d7c-6a5f-4e3d-8c2b-1a0f9e8d7c6b',
      status: 'todo',
      steps: [{ completed: false, name: 'Check the pantry' }],
      title: 'Plan weekend groceries',
    },
    {
      createdOn: addDays(today, -1),
      description: 'Compare with last month before sending.',
      id: '2c3d4e5f-6a7b-4c8d-9e0f-1a2b3c4d5e6f',
      status: 'inProgress',
      title: 'Draft the monthly budget',
    },
    {
      createdOn: today,
      id: '7e8f9a0b-1c2d-4e3f-8a4b-5c6d7e8f9a0b',
      status: 'completed',
      title: 'Call the bank',
    },
    {
      createdOn: addDays(today, 3),
      description: 'Ask about early morning slots.',
      id: '4a5b6c7d-8e9f-4a0b-9c1d-2e3f4a5b6c7d',
      status: 'todo',
      title: 'Book dentist appointment',
    },
  ];
}
