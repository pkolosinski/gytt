import type { Task } from '../types/task';

interface TaskCardProps {
    task: Task;
    onOpen: () => void;
}

export const TaskCard = ({ task, onOpen }: TaskCardProps) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'inProgress':
                return 'bg-blue-500';
            case 'todo':
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div
            className="flex flex-col gap-2 rounded-lg border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
            onClick={onOpen}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpen();
                }
            }}
            aria-label={`Task: ${task.title}`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <h3 className="font-medium text-foreground">{task.title}</h3>
                    {task.details && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {task.details}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span
                    className={`h-2 w-2 rounded-full ${getStatusColor(task.status)}`}
                    aria-hidden="true"
                />
                <span className="text-xs text-muted-foreground">
                    {task.status.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
            </div>
        </div>
    );
};
