import type { TaskPatch as ApiTaskPatch, Problem } from '@/shared/generated/api/gystApi.schemas.ts';
import { createTask, deleteTask, listTasks, updateTask } from '@/shared/generated/api/tasks.ts';
import type { LocalDate } from '@/shared/lib/local-date.ts';
import type { NewTask, TaskListItem, TaskPatch } from '../models/task.ts';

/** The Tasks operations used by the UI. */
export type TasksApi = {
  listTasks(date: LocalDate): Promise<TaskListItem[]>;
  createTask(task: NewTask): Promise<TaskListItem>;
  updateTask(id: string, revision: number, patch: TaskPatch): Promise<TaskListItem>;
  deleteTask(id: string, revision: number): Promise<void>;
};

/** A Task request the server did not accept. A `412` means the Task changed since it was loaded. */
export class TasksApiError extends Error {
  readonly status: number;

  constructor(status: number, problem?: Problem) {
    super(problem?.title ?? `Tasks request failed with status ${status}`);
    this.name = 'TasksApiError';
    this.status = status;
  }
}

const ifMatch = (revision: number): RequestInit => ({ headers: { 'If-Match': `"${revision}"` } });

/** An explicitly cleared description is sent as `null`; an omitted one stays unchanged. */
const toApiPatch = (patch: TaskPatch): ApiTaskPatch => ({
  ...patch,
  ...('description' in patch && { description: patch.description ?? null }),
});

/** The Tasks API backed by the GYST server. */
export const tasksApi: TasksApi = {
  async listTasks(date) {
    const res = await listTasks({ date });
    if (res.status !== 200) {
      throw new TasksApiError(res.status, res.data);
    }
    return res.data;
  },
  async createTask(task) {
    const res = await createTask(task);
    if (res.status !== 201) {
      throw new TasksApiError(res.status, res.data);
    }
    return res.data;
  },
  async updateTask(id, revision, patch) {
    const res = await updateTask(id, toApiPatch(patch), ifMatch(revision));
    if (res.status !== 200) {
      throw new TasksApiError(res.status, res.data);
    }
    return res.data;
  },
  async deleteTask(id, revision) {
    const res = await deleteTask(id, ifMatch(revision));
    if (res.status !== 204) {
      throw new TasksApiError(res.status, res.data);
    }
  },
};
