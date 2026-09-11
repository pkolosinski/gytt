import { t } from 'i18next';

import { addDays, type LocalDate } from '@/shared/lib/local-date.ts';

import { validateTaskDraft } from '../helpers/task-draft.ts';
import type {
    TaskBoardItem,
    TaskBoardView,
    TaskInput,
    TaskRecordView,
    TaskStatus,
    TaskView,
} from '../models/task.ts';
import { TaskApiError } from './task-api-error.ts';
import type { TasksApi } from './tasks-api.ts';

type MockTasksApiOptions = {
    tasks?: readonly TaskRecordView[];
    delayMs?: number;
};

type StatusTransition = {
    effectiveDate: LocalDate;
    sequence: number;
    status: TaskStatus;
};

function wait(delayMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function compareTransitions(left: StatusTransition, right: StatusTransition): number {
    if (left.effectiveDate !== right.effectiveDate) {
        return left.effectiveDate < right.effectiveDate ? -1 : 1;
    }
    return left.sequence - right.sequence;
}

/** The transition that applies on `date`, or `null` before the first one. */
function resolveTransition(
    transitions: readonly StatusTransition[],
    date: LocalDate,
): StatusTransition | null {
    let resolved: StatusTransition | null = null;
    for (const transition of transitions) {
        if (transition.effectiveDate <= date) {
            resolved = transition;
        }
    }
    return resolved;
}

function latestTransition(transitions: readonly StatusTransition[]): StatusTransition {
    const latest = transitions.at(-1);
    if (latest === undefined) {
        throw new Error('A Task always has its initial status transition.');
    }
    return latest;
}

function seedTransitions(record: TaskRecordView): StatusTransition[] {
    const initial: StatusTransition = {
        effectiveDate: record.startDate,
        sequence: 0,
        status: 'todo',
    };
    if (record.latestStatus === 'todo' && record.latestStatusEffectiveDate === record.startDate) {
        return [initial];
    }
    if (record.latestStatusEffectiveDate === record.startDate) {
        return [{ ...initial, status: record.latestStatus }];
    }
    return [
        initial,
        {
            effectiveDate: record.latestStatusEffectiveDate,
            sequence: 1,
            status: record.latestStatus,
        },
    ];
}

function toTaskView(record: TaskRecordView, transition: StatusTransition): TaskView {
    return {
        convertedHabitId: record.convertedHabitId,
        details: record.details,
        id: record.id,
        startDate: record.startDate,
        status: transition.status,
        statusEffectiveDate: transition.effectiveDate,
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
        title: input.title.trim(),
        type: input.type,
    };
}

function assertValid(input: TaskInput): void {
    const fields = validateTaskDraft(
        {
            details: input.details ?? '',
            startDate: input.startDate,
            title: input.title,
        },
        t,
    );
    if (Object.keys(fields).length > 0) {
        throw new TaskApiError('VALIDATION_FAILED', 'The Task is not valid.', fields);
    }
}

function hasSameContent(record: TaskRecordView, input: TaskInput): boolean {
    return (
        record.type === input.type &&
        record.title === input.title &&
        record.details === input.details &&
        record.startDate === input.startDate
    );
}

function nextVersion(version: string): string {
    return String(Number(version) + 1);
}

/**
 * An in-memory stand-in for the Tasks API. It follows the specified Anytime
 * visibility, effective-dated status, idempotent create, and version-conflict
 * rules so the UI can be accepted before the contract and backend exist.
 */
export function createMockTasksApi({
    tasks = [],
    delayMs = 0,
}: MockTasksApiOptions = {}): TasksApi {
    const records = new Map<string, TaskRecordView>(tasks.map((task) => [task.id, { ...task }]));
    const transitions = new Map<string, StatusTransition[]>(
        tasks.map((task) => [task.id, seedTransitions(task)]),
    );
    const deletedTaskIds = new Set<string>();

    function requireRecord(taskId: string): TaskRecordView {
        const record = records.get(taskId);
        if (record === undefined) {
            throw new TaskApiError('NOT_FOUND', 'The Task no longer exists.');
        }
        return record;
    }

    function transitionsOf(taskId: string): StatusTransition[] {
        return transitions.get(taskId) ?? [];
    }

    function viewOn(record: TaskRecordView, date: LocalDate): TaskView {
        const history = transitionsOf(record.id);
        return toTaskView(record, resolveTransition(history, date) ?? latestTransition(history));
    }

    function save(record: TaskRecordView, history: StatusTransition[]): TaskRecordView {
        const latest = latestTransition(history);
        const saved: TaskRecordView = {
            ...record,
            latestStatus: latest.status,
            latestStatusEffectiveDate: latest.effectiveDate,
        };
        records.set(saved.id, saved);
        transitions.set(saved.id, history);
        return saved;
    }

    return {
        async createTask(rawInput, initialStatus) {
            await wait(delayMs);
            assertValid(rawInput);
            const input = normalizeInput(rawInput);
            if (deletedTaskIds.has(input.id)) {
                throw new TaskApiError('ID_REUSED', 'This Task ID was already used.');
            }
            const existing = records.get(input.id);
            if (existing !== undefined) {
                if (
                    hasSameContent(existing, input) &&
                    transitionsOf(existing.id)[0]?.status === initialStatus
                ) {
                    return viewOn(existing, existing.startDate);
                }
                throw new TaskApiError('ID_REUSED', 'This Task ID was already used.');
            }
            const record = save(
                {
                    ...input,
                    convertedHabitId: null,
                    fixedDate: null,
                    latestStatus: initialStatus,
                    latestStatusEffectiveDate: input.startDate,
                    version: '1',
                },
                [{ effectiveDate: input.startDate, sequence: 0, status: initialStatus }],
            );
            return viewOn(record, record.startDate);
        },

        async deleteTask(taskId, version) {
            await wait(delayMs);
            const current = records.get(taskId);
            if (current === undefined) {
                if (deletedTaskIds.has(taskId)) {
                    return;
                }
                throw new TaskApiError('NOT_FOUND', 'The Task no longer exists.');
            }
            if (current.version !== version) {
                throw new TaskApiError('VERSION_CONFLICT', 'A newer version of this Task exists.');
            }
            records.delete(taskId);
            transitions.delete(taskId);
            deletedTaskIds.add(taskId);
        },

        async getBoard(date: LocalDate) {
            await wait(delayMs);
            const board: TaskBoardView = { completed: [], date, inProgress: [], todo: [] };
            for (const record of records.values()) {
                const transition = resolveTransition(transitionsOf(record.id), date);
                const completedEarlier =
                    transition?.status === 'completed' && transition.effectiveDate < date;
                if (record.startDate <= date && transition !== null && !completedEarlier) {
                    const item: TaskBoardItem = {
                        task: toTaskView(record, transition),
                        type: 'task',
                    };
                    board[transition.status].push(item);
                }
            }
            return board;
        },

        async getTask(taskId) {
            await wait(delayMs);
            return { ...requireRecord(taskId) };
        },

        async moveTask(taskId, { effectiveDate, status, version }) {
            await wait(delayMs);
            const current = requireRecord(taskId);
            if (current.version !== version) {
                throw new TaskApiError('VERSION_CONFLICT', 'A newer version of this Task exists.');
            }
            if (effectiveDate < current.startDate) {
                throw new TaskApiError(
                    'INVALID_CALENDAR_OPERATION',
                    'The status cannot change before the Task starts.',
                );
            }
            const history = transitionsOf(taskId);
            if (resolveTransition(history, effectiveDate)?.status === status) {
                return viewOn(current, effectiveDate);
            }
            const sequence = Math.max(...history.map((transition) => transition.sequence)) + 1;
            const record = save(
                { ...current, version: nextVersion(current.version) },
                [...history, { effectiveDate, sequence, status }].sort(compareTransitions),
            );
            return viewOn(record, effectiveDate);
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
                return viewOn(current, current.startDate);
            }
            const history = transitionsOf(taskId);
            if (input.startDate !== current.startDate && history.length > 1) {
                throw new TaskApiError('VALIDATION_FAILED', 'The Task is not valid.', {
                    startDate: 'The start date cannot change after the status has moved.',
                });
            }
            const record = save(
                { ...current, ...input, version: nextVersion(current.version) },
                history.map((transition) =>
                    transition.sequence === 0
                        ? { ...transition, effectiveDate: input.startDate }
                        : transition,
                ),
            );
            return viewOn(record, record.startDate);
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
    ): TaskRecordView => ({
        convertedHabitId: null,
        details,
        fixedDate: null,
        id,
        latestStatus: 'todo',
        latestStatusEffectiveDate: startDate,
        startDate,
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
        {
            ...sample(
                '2c3d4e5f-6a7b-4c8d-9e0f-1a2b3c4d5e6f',
                'Draft the monthly budget',
                'Compare with last month before sending.',
                addDays(today, -1),
            ),
            latestStatus: 'inProgress',
            latestStatusEffectiveDate: today,
        },
        {
            ...sample('7e8f9a0b-1c2d-4e3f-8a4b-5c6d7e8f9a0b', 'Call the bank', null, today),
            latestStatus: 'completed',
        },
        sample(
            '4a5b6c7d-8e9f-4a0b-9c1d-2e3f4a5b6c7d',
            'Book dentist appointment',
            'Ask about early morning slots.',
            addDays(today, 3),
        ),
    ];
}
