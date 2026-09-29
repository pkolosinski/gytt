import { useId } from 'react';

import { cn } from 'cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

import { buttonVariants } from '@/shared/generated/shadcn/ui/button.tsx';
import { formControlClassName } from '@/shared/lib/form-control.ts';
import { addDays, parseLocalDate, type LocalDate } from '@/shared/lib/local-date.ts';

import { tasksPath } from '../helpers/task-routes.ts';

interface TaskDateNavigationProps {
    onSelectDate: (date: LocalDate) => void;
    selectedDate: LocalDate;
    today: LocalDate;
}

export function TaskDateNavigation({ onSelectDate, selectedDate, today }: TaskDateNavigationProps) {
    const dateInputId = useId();

    return (
        <nav aria-label="Task dates" className="flex flex-wrap items-end gap-2">
            <div className="flex items-center gap-2">
                <Link
                    aria-label="Previous day"
                    className={cn(buttonVariants({ size: 'icon', variant: 'outline' }))}
                    to={tasksPath(addDays(selectedDate, -1))}
                >
                    <ChevronLeft aria-hidden="true" />
                </Link>
                <Link
                    aria-current={selectedDate === today ? 'date' : undefined}
                    className={cn(buttonVariants({ variant: 'outline' }))}
                    to={tasksPath(today)}
                >
                    Today
                </Link>
                <Link
                    aria-label="Next day"
                    className={cn(buttonVariants({ size: 'icon', variant: 'outline' }))}
                    to={tasksPath(addDays(selectedDate, 1))}
                >
                    <ChevronRight aria-hidden="true" />
                </Link>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor={dateInputId}>
                    Go to date
                </label>
                <input
                    className={formControlClassName}
                    id={dateInputId}
                    onChange={(event) => {
                        const date = parseLocalDate(event.target.value);
                        if (date !== null) {
                            onSelectDate(date);
                        }
                    }}
                    type="date"
                    value={selectedDate}
                />
            </div>
        </nav>
    );
}
