import {
    TASK_STATUSES,
    type TaskBoardView,
    type TaskStatus,
    type TaskView,
} from '../models/task.ts';

/** Returns a Task from any status column on one board date. */
export function findTaskInBoard(
    view: TaskBoardView | null,
    taskId: string | number,
): TaskView | null {
    if (view === null) {
        return null;
    }
    const item = TASK_STATUSES.flatMap((status) => view[status]).find(
        (candidate) => candidate.task.id === taskId,
    );
    return item?.task ?? null;
}

/** Returns a board with one Task moved to the end of the `status` column. */
export function moveBoardItem(view: TaskBoardView, movedTask: TaskView): TaskBoardView {
    const item = TASK_STATUSES.flatMap((column) => view[column]).find(
        (candidate) => candidate.task.id === movedTask.id,
    );
    if (item === undefined) {
        return view;
    }
    const moved = { ...item, task: movedTask };
    const without = (column: TaskStatus) =>
        view[column].filter((candidate) => candidate.task.id !== movedTask.id);
    return {
        completed: without('completed'),
        date: view.date,
        inProgress: without('inProgress'),
        todo: without('todo'),
        [movedTask.status]: [...without(movedTask.status), moved],
    };
}
