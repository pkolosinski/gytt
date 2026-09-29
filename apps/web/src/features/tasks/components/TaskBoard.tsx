import type { LocalDate } from '@/shared/lib/local-date.ts';

import { TASK_STATUSES, type TaskBoardView } from '../models/task.ts';
import { TaskColumn } from './TaskColumn.tsx';

interface TaskBoardProps {
    onOpenTask: (taskId: string) => void;
    selectedDate: LocalDate;
    /** `null` while the board is loading; the column structure stays in place. */
    view: TaskBoardView | null;
}

export function TaskBoard({ onOpenTask, selectedDate, view }: TaskBoardProps) {
    return (
        <div
            aria-busy={view === null}
            aria-label="Task board"
            className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:-mx-12 sm:scroll-px-12 sm:px-12 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0"
            role="region"
            tabIndex={0}
        >
            {view === null && (
                <p className="sr-only" role="status">
                    Loading tasks
                </p>
            )}
            {TASK_STATUSES.map((status) => (
                <TaskColumn
                    items={view === null ? null : view[status]}
                    key={status}
                    onOpenTask={onOpenTask}
                    selectedDate={selectedDate}
                    status={status}
                />
            ))}
        </div>
    );
}
