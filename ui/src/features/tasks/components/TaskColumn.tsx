import type { TaskBoardItem } from '../types/task';

import { TaskCard } from './TaskCard';

interface TaskColumnProps {
    status: string;
    items: TaskBoardItem[];
    onOpenTask: (taskId: string) => void;
}

export const TaskColumn = ({ status, items, onOpenTask }: TaskColumnProps) => {
    const getColumnTitle = (status: string): string => {
        switch (status) {
            case 'todo':
                return 'To do';
            case 'inProgress':
                return 'In progress';
            case 'completed':
                return 'Completed';
            default:
                return status;
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                    {getColumnTitle(status)}
                </h2>
                <span className="text-xs text-muted-foreground">
                    {items.length}
                </span>
            </div>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                {items.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-muted/30 bg-muted/50 p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            No tasks in {getColumnTitle(status)}
                        </p>
                    </div>
                ) : (
                    items.map((item) => (
                        <TaskCard
                            key={item.task.id}
                            task={item.task}
                            onOpen={() => onOpenTask(item.task.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
