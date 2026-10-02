import { useState } from 'react';

import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import type { LocalDate } from '@/shared/lib/local-date.ts';

import { TaskApiError } from '../api/task-api-error.ts';
import type { TaskStatus, TaskView } from '../models/task.ts';
import { useMoveTask, usePendingTaskMoves } from './task-queries.ts';

/** The task whose details status control receives focus after it moves to `status`. */
export type TaskFocusTarget = { status: TaskStatus; taskId: string };

export type TaskMoveSource = 'drag' | 'menu';

function moveErrorMessage(t: TFunction, task: TaskView, error: unknown): string {
    if (error instanceof TaskApiError && error.code === 'VERSION_CONFLICT') {
        return t('tasks.moves.conflict', { title: task.title });
    }
    if (error instanceof TaskApiError && error.code === 'INVALID_CALENDAR_OPERATION') {
        return t('tasks.moves.invalid', { reason: error.message, title: task.title });
    }
    return t('tasks.moves.unavailable', { title: task.title });
}

/**
 * Moves Tasks on one board date and owns the resulting announcement, error, and
 * focus target so status-menu users keep their place when a card changes column.
 */
export function useTaskMoves(date: LocalDate) {
    const { t } = useTranslation();
    const moveTask = useMoveTask();
    const pendingTaskIds = usePendingTaskMoves();
    const [announcement, setAnnouncement] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [errorTaskId, setErrorTaskId] = useState<string | null>(null);
    const [focusTarget, setFocusTarget] = useState<TaskFocusTarget | null>(null);

    function move(task: TaskView, status: TaskStatus, source: TaskMoveSource): Promise<boolean> {
        setAnnouncement('');
        setError(null);
        setErrorTaskId(null);
        if (source === 'menu') {
            setFocusTarget({ status, taskId: task.id });
        }
        return moveTask.mutateAsync({ date, status, task }).then(
            () => {
                setAnnouncement(
                    t('tasks.moves.moved', {
                        status: t(`tasks.status.${status}`),
                        title: task.title,
                    }),
                );
                return true;
            },
            (cause: unknown) => {
                setError(moveErrorMessage(t, task, cause));
                setErrorTaskId(task.id);
                if (source === 'menu') {
                    setFocusTarget({ status: task.status, taskId: task.id });
                }
                return false;
            },
        );
    }

    return {
        announcement,
        clearAnnouncement: () => setAnnouncement(''),
        clearFocusTarget: () => setFocusTarget(null),
        dismissError: () => {
            setError(null);
            setErrorTaskId(null);
        },
        error,
        errorTaskId,
        focusTarget,
        move,
        pendingTaskIds,
    };
}
