import { useId } from 'react';

import { cn } from 'cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

const joinedButtonClassName = 'relative focus-visible:z-10';

export function TaskDateNavigation({ onSelectDate, selectedDate, today }: TaskDateNavigationProps) {
    const { t } = useTranslation();
    const dateInputId = useId();

    return (
        <nav aria-label={t('tasks.navigation.label')} className="flex flex-wrap items-center gap-2">
            <div className="flex items-center" role="group">
                <Link
                    aria-label={t('tasks.navigation.previousDay')}
                    className={cn(
                        buttonVariants({ size: 'icon', variant: 'outline' }),
                        joinedButtonClassName,
                        'rounded-r-none',
                    )}
                    to={tasksPath(addDays(selectedDate, -1))}
                >
                    <ChevronLeft aria-hidden="true" />
                </Link>
                <Link
                    aria-current={selectedDate === today ? 'date' : undefined}
                    className={cn(
                        buttonVariants({ variant: 'outline' }),
                        joinedButtonClassName,
                        '-ml-px rounded-none',
                    )}
                    to={tasksPath(today)}
                >
                    {t('common.today')}
                </Link>
                <Link
                    aria-label={t('tasks.navigation.nextDay')}
                    className={cn(
                        buttonVariants({ size: 'icon', variant: 'outline' }),
                        joinedButtonClassName,
                        '-ml-px rounded-l-none',
                    )}
                    to={tasksPath(addDays(selectedDate, 1))}
                >
                    <ChevronRight aria-hidden="true" />
                </Link>
            </div>
            <label className="sr-only" htmlFor={dateInputId}>
                {t('tasks.navigation.goToDate')}
            </label>
            <input
                className={cn(formControlClassName, 'h-8 w-auto py-0')}
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
        </nav>
    );
}
