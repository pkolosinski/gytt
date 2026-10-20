import { useQuery } from '@tanstack/react-query';

import type { LocalDate } from '@/shared/lib/local-date.ts';
import { tasksApi } from '../api/tasks-api.ts';
import type { TaskBoardView, TaskListItem } from '../models/task.ts';

function toTaskBoardView(date: LocalDate, tasks: readonly TaskListItem[]): TaskBoardView {
  const board: TaskBoardView = { completed: [], date, inProgress: [], todo: [] };
  for (const task of tasks) {
    board[task.status].push(task);
  }
  return board;
}

export function useTaskBoard(date: LocalDate) {
  return useQuery({
    queryFn: async () => toTaskBoardView(date, await tasksApi.listTasks(date)),
    queryKey: ['tasks', 'board', date],
  });
}
