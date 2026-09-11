import { cn } from 'cn';
import { Circle, CircleCheck, CircleDotDashed, type LucideIcon } from 'lucide-react';

import type { TaskStatus } from '../models/task.ts';

const STATUS_ICONS: Record<TaskStatus, { className: string; icon: LucideIcon }> = {
    completed: { className: 'text-primary', icon: CircleCheck },
    inProgress: { className: 'text-primary', icon: CircleDotDashed },
    todo: { className: 'text-muted-foreground', icon: Circle },
};

interface TaskStatusIconProps {
    className?: string;
    status: TaskStatus;
}

/** A non-color cue for a Task status; always decorative next to its text label. */
export function TaskStatusIcon({ className, status }: TaskStatusIconProps) {
    const { className: toneClassName, icon: Icon } = STATUS_ICONS[status];
    return <Icon aria-hidden="true" className={cn('size-4 shrink-0', toneClassName, className)} />;
}
