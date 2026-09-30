import { todayLocalDate, type LocalDate } from '@/shared/lib/local-date.ts';

import type {
    TaskBoardView,
    TaskInput,
    TaskMoveInput,
    TaskRecordView,
    TaskStatus,
    TaskView,
} from '../models/task.ts';
import { createMockTasksApi, createSampleTasks } from './mock-tasks-api.ts';

/** The Tasks operations used by the UI. */
export type TasksApi = {
    getBoard(date: LocalDate): Promise<TaskBoardView>;
    getTask(taskId: string): Promise<TaskRecordView>;
    createTask(input: TaskInput, initialStatus: TaskStatus): Promise<TaskView>;
    updateTask(taskId: string, input: TaskInput, version: string): Promise<TaskView>;
    moveTask(taskId: string, move: TaskMoveInput): Promise<TaskView>;
    deleteTask(taskId: string, version: string): Promise<void>;
};

/**
 * The Tasks API imported directly by query options and hooks. It is backed by
 * in-memory sample data until the OpenAPI contract and generated client are
 * connected.
 */
export const tasksApi: TasksApi = createMockTasksApi({
    delayMs: 150,
    tasks: createSampleTasks(todayLocalDate()),
});
