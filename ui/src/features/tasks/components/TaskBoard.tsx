import type { TaskBoardView } from '../types/task';

import { TaskColumn } from './TaskColumn';

interface TaskBoardProps {
    board: TaskBoardView;
    onOpenTask: (taskId: string) => void;
}

export const TaskBoard = ({ board, onOpenTask }: TaskBoardProps) => {
    return (
        <div className="flex flex-1 flex-col gap-6">
            <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-3">
                <TaskColumn
                    status="todo"
                    items={board.todo}
                    onOpenTask={onOpenTask}
                />
                <TaskColumn
                    status="inProgress"
                    items={board.inProgress}
                    onOpenTask={onOpenTask}
                />
                <TaskColumn
                    status="completed"
                    items={board.completed}
                    onOpenTask={onOpenTask}
                />
            </div>
        </div>
    );
};
