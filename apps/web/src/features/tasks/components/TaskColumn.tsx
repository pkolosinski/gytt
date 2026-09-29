import { Badge } from '@/shared/generated/shadcn/ui/badge.tsx';
import type { TranslationKey } from '@/shared/i18n/translations.ts';
import { useLocale } from '@/shared/i18n/useLocale.ts';
import type { LocalDate } from '@/shared/lib/local-date.ts';

import type { TaskBoardItem, TaskStatus } from '../models/task.ts';
import { StandardTaskCard } from './StandardTaskCard.tsx';

const statusTranslationKeys = {
    completed: 'tasks.status.completed',
    inProgress: 'tasks.status.inProgress',
    todo: 'tasks.status.todo',
} satisfies Record<TaskStatus, TranslationKey>;

interface TaskColumnProps {
    items: readonly TaskBoardItem[] | null;
    onOpenTask: (taskId: string) => void;
    selectedDate: LocalDate;
    status: TaskStatus;
}

/** One status column. Its heading stays visible and its body stays empty when there are no cards. */
export function TaskColumn({ items, onOpenTask, selectedDate, status }: TaskColumnProps) {
    const { t } = useLocale();
    const headingId = `task-column-${status}`;
    const label = t(statusTranslationKeys[status]);

    return (
        <section
            aria-labelledby={headingId}
            className="flex w-[82%] max-w-80 shrink-0 snap-start flex-col gap-3 rounded-xl bg-muted/50 p-3 md:w-auto md:max-w-none md:shrink"
            data-status={status}
        >
            <div className="flex items-center justify-between gap-2">
                <h2 className="m-0 text-base font-medium text-foreground" id={headingId}>
                    {label}
                </h2>
                {items !== null && (
                    <Badge
                        aria-label={t('tasks.countIn', { count: items.length, status: label })}
                        variant="secondary"
                    >
                        {items.length}
                    </Badge>
                )}
            </div>
            <ul
                aria-labelledby={headingId}
                className="m-0 flex min-h-24 list-none flex-col gap-2 p-0"
            >
                {items?.map((item) => (
                    <li key={item.task.id}>
                        <StandardTaskCard
                            onOpen={onOpenTask}
                            selectedDate={selectedDate}
                            task={item.task}
                        />
                    </li>
                ))}
            </ul>
        </section>
    );
}
