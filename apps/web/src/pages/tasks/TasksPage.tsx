import { useState } from 'react';

import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
    TaskBoard,
    TaskBoardError,
    TaskDateNavigation,
    TaskModal,
    tasksPath,
    useTaskBoard,
    useTaskMoves,
    type TaskModalState,
} from '@/features/tasks/index.ts';
import { StatusMessage } from '@/shared/components/StatusMessage.tsx';
import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import { formatLocalDateLong, todayLocalDate, type LocalDate } from '@/shared/lib/local-date.ts';

interface TasksPageProps {
    date: LocalDate;
}

export function TasksPage({ date }: TasksPageProps) {
    const { i18n, t } = useTranslation();
    const navigate = useNavigate();
    const today = todayLocalDate();
    const board = useTaskBoard(date);
    const moves = useTaskMoves(date);
    const [modal, setModal] = useState<TaskModalState | null>(null);

    function closeModal() {
        setModal(null);
        moves.clearAnnouncement();
    }

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="font-heading m-0 text-4xl tracking-tight text-foreground">
                        {t('tasks.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        <time dateTime={date}>{formatLocalDateLong(date, i18n.language)}</time>
                        {date === today && <span> · {t('common.today')}</span>}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <TaskDateNavigation
                        onSelectDate={(selected) => void navigate(tasksPath(selected))}
                        selectedDate={date}
                        today={today}
                    />
                    <Button onClick={() => setModal({ mode: 'create', status: 'todo' })}>
                        <Plus aria-hidden="true" data-icon="inline-start" />
                        {t('tasks.newTask')}
                    </Button>
                </div>
            </header>

            <p aria-live="polite" className="sr-only" role="status">
                {modal === null ? moves.announcement : ''}
            </p>
            {modal === null && moves.error !== null && (
                <StatusMessage
                    action={
                        <Button onClick={moves.dismissError} size="sm" variant="outline">
                            {t('common.dismiss')}
                        </Button>
                    }
                    title={t('tasks.notMovedTitle')}
                    tone="error"
                >
                    {moves.error}
                </StatusMessage>
            )}

            {board.isError ? (
                <TaskBoardError
                    isRetrying={board.isFetching}
                    onRetry={() => void board.refetch()}
                />
            ) : (
                <TaskBoard
                    onCreateTask={(status) => setModal({ mode: 'create', status })}
                    onMoveTask={(task, status) => moves.move(task, status, 'drag')}
                    onOpenTask={(task) => setModal({ mode: 'task', task })}
                    pendingTaskIds={moves.pendingTaskIds}
                    selectedDate={date}
                    view={board.data ?? null}
                />
            )}

            <TaskModal
                defaultDate={today}
                moves={moves}
                onClose={closeModal}
                onCreated={closeModal}
                selectedDate={date}
                state={modal}
            />
        </div>
    );
}
