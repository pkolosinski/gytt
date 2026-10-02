import type { LocalDate } from '@/shared/lib/local-date.ts';

export type TaskStatus = 'todo' | 'inProgress' | 'completed';

export const TASK_STATUSES: readonly TaskStatus[] = ['todo', 'inProgress', 'completed'];

export type TaskStep = {
    id: string;
    text: string;
    isCompleted: boolean;
};

export type AnytimeTaskInput = {
    id: string;
    type: 'anytime';
    title: string;
    details: string | null;
    startDate: LocalDate;
    steps: TaskStep[];
};

export type TaskInput = AnytimeTaskInput;

/** A Task resolved for one board date. */
export type TaskView = TaskInput & {
    status: TaskStatus;
    statusEffectiveDate: LocalDate;
    convertedHabitId: string | null;
    version: string;
};

/** The date-independent Task record used for details and conflict recovery. */
export type TaskRecordView = {
    id: string;
    type: 'anytime';
    title: string;
    details: string | null;
    startDate: LocalDate;
    fixedDate: null;
    steps: TaskStep[];
    latestStatus: TaskStatus;
    latestStatusEffectiveDate: LocalDate;
    convertedHabitId: string | null;
    version: string;
};

/** An effective-dated status change for one Task, applied on the viewed board date. */
export type TaskMoveInput = {
    status: TaskStatus;
    effectiveDate: LocalDate;
    version: string;
};

export type TaskStepToggleInput = {
    isCompleted: boolean;
    effectiveDate: LocalDate;
    version: string;
};

export type TaskBoardItem = { type: 'task'; task: TaskView };

export type TaskBoardView = {
    date: LocalDate;
    todo: TaskBoardItem[];
    inProgress: TaskBoardItem[];
    completed: TaskBoardItem[];
};

export const TITLE_MAX_LENGTH = 200;
export const DETAILS_MAX_LENGTH = 5000;
export const STEP_MAX_LENGTH = 200;
