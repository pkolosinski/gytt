export type TaskProblemCode =
    | 'ID_REUSED'
    | 'INVALID_CALENDAR_OPERATION'
    | 'NOT_FOUND'
    | 'STORAGE_UNAVAILABLE'
    | 'VALIDATION_FAILED'
    | 'VERSION_CONFLICT';

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
