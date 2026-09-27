export type TaskStatus = 'todo' | 'inProgress' | 'completed';

export type TaskType = 'anytime' | 'fixedDay';

export interface Task {
    id: string;
    type: TaskType;
    title: string;
    details: string | null;
    status: TaskStatus;
    statusEffectiveDate: string;
    startDate: string | null;
    fixedDate: string | null;
    convertedHabitId: string | null;
    version: string;
}

export interface TaskBoardItem {
    type: 'task';
    task: Task;
}

export interface TaskBoardView {
    date: string;
    todo: TaskBoardItem[];
    inProgress: TaskBoardItem[];
    completed: TaskBoardItem[];
}
