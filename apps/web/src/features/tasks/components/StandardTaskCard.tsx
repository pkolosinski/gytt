import { CalendarClock } from 'lucide-react';

import { Badge } from '@/shared/generated/shadcn/ui/badge.tsx';
import { formatLocalDateShort, type LocalDate } from '@/shared/lib/local-date.ts';

import type { TaskView } from '../models/task.ts';

interface StandardTaskCardProps {
    onOpen: (taskId: string) => void;
    selectedDate: LocalDate;
    task: TaskView;
}

export function StandardTaskCard({ onOpen, selectedDate, task }: StandardTaskCardProps) {
    const isCarriedForward = task.startDate < selectedDate;

    return (
        <button
            className="flex w-full flex-col gap-2 rounded-lg bg-card p-3 text-left text-sm text-card-foreground ring-1 ring-foreground/10 transition-shadow outline-none hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
            onClick={() => onOpen(task.id)}
            type="button"
        >
            <span className="font-medium break-words text-foreground">{task.title}</span>
            {task.details !== null && (
                <span className="line-clamp-2 break-words whitespace-pre-line text-muted-foreground">
                    {task.details}
                </span>
            )}
            <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">Anytime</Badge>
                {isCarriedForward && (
                    <span className="inline-flex items-center gap-1">
                        <CalendarClock aria-hidden="true" className="size-3.5" />
                        Since {formatLocalDateShort(task.startDate)}
                    </span>
                )}
            </span>
        </button>
    );
}
