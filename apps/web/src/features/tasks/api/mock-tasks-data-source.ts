import { t } from 'i18next';

import { addDays, type LocalDate } from '@/shared/lib/local-date.ts';

import { validateTaskDraft } from '../helpers/task-draft.ts';
import type {
    TaskBoardItem,
    TaskBoardView,
    TaskInput,
    TaskRecordView,
    TaskStep,
    TaskView,
} from '../models/task.ts';
import { TaskApiError, type TasksDataSource } from './tasks-data-source.ts';

type MockTasksDataSourceOptions = {
    tasks?: readonly TaskRecordView[];
    delayMs?: number;
};

function wait(delayMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function toTaskView(record: TaskRecordView): TaskView {
    return {
        convertedHabitId: record.convertedHabitId,
        details: record.details,
        id: record.id,
        startDate: record.startDate,
        steps: record.steps.map((step) => ({ ...step })),
        status: record.latestStatus,
        statusEffectiveDate: record.latestStatusEffectiveDate,
        title: record.title,
        type: record.type,
        version: record.version,
    };
}

function normalizeInput(input: TaskInput): TaskInput {
    const details = input.details?.trim() ?? '';
    return {
        details: details.length === 0 ? null : details,
        id: input.id,
        startDate: input.startDate,
        steps: input.steps.map((step) => ({ ...step, text: step.text.trim() })),
        title: input.title.trim(),
        type: input.type,
    };
}

function assertValid(input: TaskInput): void {
    const fields = validateTaskDraft(
        {
            details: input.details ?? '',
            startDate: input.startDate,
            steps: input.steps,
            title: input.title,
        },
        t,
    );
    if (input.steps.some((step) => step.text.trim().length === 0)) {
        fields.steps = t('tasks.validation.stepRequired');
    }
    if (Object.keys(fields).length > 0) {
        throw new TaskApiError('VALIDATION_FAILED', 'The Task is not valid.', fields);
    }
}

function hasSameSteps(left: readonly TaskStep[], right: readonly TaskStep[]): boolean {
    return (
        left.length === right.length &&
        left.every((step, index) => {
            const inputStep = right[index];
            return (
                inputStep !== undefined &&
                step.id === inputStep.id &&
                step.text === inputStep.text &&
                step.isCompleted === inputStep.isCompleted
            );
        })
    );
}

function hasSameContent(record: TaskRecordView, input: TaskInput): boolean {
    return (
        record.type === input.type &&
        record.title === input.title &&
        record.details === input.details &&
        record.startDate === input.startDate &&
        hasSameSteps(record.steps, input.steps)
    );
}

/**
 * An in-memory stand-in for the Tasks API. It follows the specified Anytime
 * visibility, idempotent create, and version-conflict rules so the UI can be
 * accepted before the contract and backend exist.
 */
export function createMockTasksDataSource({
    tasks = [],
    delayMs = 0,
}: MockTasksDataSourceOptions = {}): TasksDataSource {
    const records = new Map<string, TaskRecordView>(tasks.map((task) => [task.id, { ...task }]));

    function requireRecord(taskId: string): TaskRecordView {
        const record = records.get(taskId);
        if (record === undefined) {
            throw new TaskApiError('NOT_FOUND', 'The Task no longer exists.');
        }
        return record;
    }

    return {
        async createTask(rawInput) {
            await wait(delayMs);
            assertValid(rawInput);
            const input = normalizeInput(rawInput);
            const existing = records.get(input.id);
            if (existing !== undefined) {
                if (hasSameContent(existing, input)) {
                    return toTaskView(existing);
                }
                throw new TaskApiError('ID_REUSED', 'This Task ID was already used.');
            }
            const record: TaskRecordView = {
                ...input,
                convertedHabitId: null,
                fixedDate: null,
                latestStatus: 'todo',
                latestStatusEffectiveDate: input.startDate,
                version: '1',
            };
            records.set(record.id, record);
            return toTaskView(record);
        },

        async getBoard(date: LocalDate) {
            await wait(delayMs);
            const board: TaskBoardView = { completed: [], date, inProgress: [], todo: [] };
            for (const record of records.values()) {
                if (record.startDate <= date) {
                    const item: TaskBoardItem = { task: toTaskView(record), type: 'task' };
                    board[record.latestStatus].push(item);
                }
            }
            return board;
        },

        async getTask(taskId) {
            await wait(delayMs);
            return { ...requireRecord(taskId) };
        },

        async updateTask(taskId, rawInput, version) {
            await wait(delayMs);
            if (rawInput.id !== taskId) {
                throw new TaskApiError('VALIDATION_FAILED', 'The Task ID does not match.');
            }
            const current = requireRecord(taskId);
            if (current.version !== version) {
                throw new TaskApiError('VERSION_CONFLICT', 'A newer version of this Task exists.');
            }
            assertValid(rawInput);
            const input = normalizeInput(rawInput);
            if (hasSameContent(current, input)) {
                return toTaskView(current);
            }
            const record: TaskRecordView = {
                ...current,
                ...input,
                latestStatusEffectiveDate: input.startDate,
                version: String(Number(current.version) + 1),
            };
            records.set(record.id, record);
            return toTaskView(record);
        },
    };
}

/** Sample Anytime Tasks relative to the device Today for UI review. */
export function createSampleTasks(today: LocalDate): TaskRecordView[] {
    const sample = (
        id: string,
        title: string,
        details: string | null,
        startDate: LocalDate,
        steps: TaskStep[] = [],
    ): TaskRecordView => ({
        convertedHabitId: null,
        details,
        fixedDate: null,
        id,
        latestStatus: 'todo',
        latestStatusEffectiveDate: startDate,
        startDate,
        steps,
        title,
        type: 'anytime',
        version: '1',
    });

    return [
        sample(
            '6f1c2d4e-8a3b-4c5d-9e6f-7a8b9c0d1e2f',
            'Renew library card',
            'Bring proof of address.',
            addDays(today, -2),
        ),
        sample('0b9e8d7c-6a5f-4e3d-8c2b-1a0f9e8d7c6b', 'Plan weekend groceries', null, today),
        sample(
            '4a5b6c7d-8e9f-4a0b-9c1d-2e3f4a5b6c7d',
            'Book dentist appointment',
            'Ask about early morning slots.',
            addDays(today, 3),
        ),
    ];
}
