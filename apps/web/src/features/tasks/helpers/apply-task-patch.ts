import {
  TASK_STATUSES,
  type TaskListItem,
  type TaskPatch,
  type TasksFromDate,
  type TaskStatus,
} from '../models/task.ts';

/**
 * Applies an update to a Task on the board without waiting for the server. A Task that changes
 * status joins the end of its new column; other Tasks keep their position.
 */
export const applyTaskPatch = (
  board: TasksFromDate,
  id: string,
  patch: TaskPatch & Pick<Partial<TaskListItem>, 'revision'>,
): TasksFromDate => {
  const task = TASK_STATUSES.flatMap((status) => board[status]).find((item) => item.id === id);
  if (task === undefined) {
    return board;
  }
  const updated: TaskListItem = { ...task, ...patch };
  const columnOf = (status: TaskStatus): TaskListItem[] => {
    const items = board[status];
    if (status === task.status && status === updated.status) {
      return items.map((item) => (item.id === id ? updated : item));
    }
    const rest = items.filter((item) => item.id !== id);
    return status === updated.status ? [...rest, updated] : rest;
  };

  return {
    ...board,
    inProgress: columnOf('inProgress'),
    completed: columnOf('completed'),
    todo: columnOf('todo'),
  };
};
