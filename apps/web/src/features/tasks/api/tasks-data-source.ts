import type { LocalDate } from '@/shared/lib/local-date.ts';

import type { TaskBoardView, TaskInput, TaskRecordView, TaskView } from '../models/task.ts';

export type TaskProblemCode =
    'ID_REUSED' | 'NOT_FOUND' | 'STORAGE_UNAVAILABLE' | 'VALIDATION_FAILED' | 'VERSION_CONFLICT';

export class TaskApiError extends Error {
    readonly code: TaskProblemCode;
    readonly fields: Record<string, string> | null;

    constructor(
        code: TaskProblemCode,
        detail: string,
        fields: Record<string, string> | null = null,
    ) {
        super(detail);
        this.name = 'TaskApiError';
        this.code = code;
        this.fields = fields;
    }
}

/**
 * The Tasks operations used by the UI. A mock implementation backs the UI until
 * the OpenAPI contract and generated client are connected.
 */
export type TasksDataSource = {
    getBoard(date: LocalDate): Promise<TaskBoardView>;
    getTask(taskId: string): Promise<TaskRecordView>;
    createTask(input: TaskInput): Promise<TaskView>;
    updateTask(taskId: string, input: TaskInput, version: string): Promise<TaskView>;
};
