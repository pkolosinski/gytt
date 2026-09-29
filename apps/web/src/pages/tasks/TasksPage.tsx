import { useState } from 'react';

import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

import {
    TaskBoard,
    TaskBoardError,
    TaskDateNavigation,
    TaskModal,
    tasksPath,
    useTaskBoard,
    type TaskModalState,
} from '@/features/tasks/index.ts';
import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import { useLocale } from '@/shared/i18n/useLocale.ts';
import { formatLocalDateLong, todayLocalDate, type LocalDate } from '@/shared/lib/local-date.ts';

interface TasksPageProps {
    date: LocalDate;
}

export function TasksPage({ date }: TasksPageProps) {
    const navigate = useNavigate();
    const { locale, t } = useLocale();
    const today = todayLocalDate();
    const board = useTaskBoard(date);
    const [modal, setModal] = useState<TaskModalState | null>(null);

    return (
        <main className="flex min-w-0 flex-1 flex-col gap-6 px-5 py-8 text-left sm:px-12 sm:py-12">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="m-0 font-heading text-4xl tracking-tight text-foreground">
                        {t('tasks.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        <time dateTime={date}>{formatLocalDateLong(date, locale)}</time>
                        {date === today && <span> · {t('tasks.today')}</span>}
                    </p>
                </div>
                <Button
                    className="self-start sm:self-auto"
                    onClick={() => setModal({ mode: 'create' })}
                >
                    <Plus aria-hidden="true" data-icon="inline-start" />
                    {t('tasks.new')}
                </Button>
            </header>

            <TaskDateNavigation
                onSelectDate={(selected) => void navigate(tasksPath(selected))}
                selectedDate={date}
                today={today}
            />

            {board.isError ? (
                <TaskBoardError
                    isRetrying={board.isFetching}
                    onRetry={() => void board.refetch()}
                />
            ) : (
                <TaskBoard
                    onOpenTask={(taskId) => setModal({ mode: 'task', taskId })}
                    selectedDate={date}
                    view={board.data ?? null}
                />
            )}

            <TaskModal
                defaultDate={today}
                onClose={() => setModal(null)}
                onCreated={(taskId) => setModal({ mode: 'task', taskId })}
                selectedDate={date}
                state={modal}
            />
        </main>
    );
}
