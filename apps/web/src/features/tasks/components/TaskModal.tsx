import { useState } from 'react';

import { Dialog } from '@base-ui/react/dialog';
import { Pencil, X } from 'lucide-react';

import { StatusMessage } from '@/shared/components/StatusMessage.tsx';
import { Badge } from '@/shared/generated/shadcn/ui/badge.tsx';
import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import { formatLocalDateLong, type LocalDate } from '@/shared/lib/local-date.ts';

import { useTaskRecord } from '../hooks/task-queries.ts';
import { TASK_STATUS_LABELS, type TaskRecordView } from '../models/task.ts';
import { TaskEditor } from './TaskEditor.tsx';

export type TaskModalState = { mode: 'create' } | { mode: 'task'; taskId: string };

interface TaskModalProps {
    defaultDate: LocalDate;
    onClose: () => void;
    onCreated: (taskId: string) => void;
    selectedDate: LocalDate;
    state: TaskModalState | null;
}

/** The single modal used by every Tasks-board card and the create action. */
export function TaskModal({
    defaultDate,
    onClose,
    onCreated,
    selectedDate,
    state,
}: TaskModalProps) {
    return (
        <Dialog.Root
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            open={state !== null}
        >
            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 bg-black/30 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
                <Dialog.Popup className="fixed top-1/2 left-1/2 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-xl bg-popover p-5 text-left text-sm text-popover-foreground ring-1 ring-foreground/10 transition duration-150 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
                    {state?.mode === 'create' && (
                        <>
                            <TaskModalHeader title="New task" />
                            <TaskEditor
                                defaultDate={defaultDate}
                                initial={null}
                                onCancel={onClose}
                                onSaved={(task) => onCreated(task.id)}
                            />
                        </>
                    )}
                    {state?.mode === 'task' && (
                        <TaskRecordContent
                            defaultDate={defaultDate}
                            key={state.taskId}
                            selectedDate={selectedDate}
                            taskId={state.taskId}
                        />
                    )}
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

interface TaskModalHeaderProps {
    title: string;
}

function TaskModalHeader({ title }: TaskModalHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="m-0 font-heading text-xl font-medium break-words text-foreground">
                {title}
            </Dialog.Title>
            <Dialog.Close render={<Button aria-label="Close" size="icon-sm" variant="ghost" />}>
                <X aria-hidden="true" />
            </Dialog.Close>
        </div>
    );
}

interface TaskRecordContentProps {
    defaultDate: LocalDate;
    selectedDate: LocalDate;
    taskId: string;
}

function TaskRecordContent({ defaultDate, selectedDate, taskId }: TaskRecordContentProps) {
    const [isEditing, setIsEditing] = useState(false);
    const record = useTaskRecord(taskId);

    if (record.isPending) {
        return (
            <>
                <TaskModalHeader title="Task" />
                <p className="text-muted-foreground" role="status">
                    Loading task…
                </p>
            </>
        );
    }

    if (record.isError) {
        return (
            <>
                <TaskModalHeader title="Task" />
                <StatusMessage
                    action={
                        <Button onClick={() => void record.refetch()} size="sm" variant="outline">
                            Retry
                        </Button>
                    }
                    title="Task unavailable"
                    tone="error"
                >
                    The task could not be loaded from the local service.
                </StatusMessage>
            </>
        );
    }

    if (isEditing) {
        return (
            <>
                <TaskModalHeader title="Edit task" />
                <TaskEditor
                    defaultDate={defaultDate}
                    initial={record.data}
                    onCancel={() => setIsEditing(false)}
                    onSaved={() => setIsEditing(false)}
                />
            </>
        );
    }

    return (
        <>
            <TaskModalHeader title={record.data.title} />
            <TaskDetails
                onEdit={() => setIsEditing(true)}
                record={record.data}
                selectedDate={selectedDate}
            />
        </>
    );
}

interface TaskDetailsProps {
    onEdit: () => void;
    record: TaskRecordView;
    selectedDate: LocalDate;
}

function TaskDetails({ onEdit, record, selectedDate }: TaskDetailsProps) {
    const isVisibleOnSelectedDate = record.startDate <= selectedDate;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Anytime</Badge>
                <Badge variant="secondary">{TASK_STATUS_LABELS[record.latestStatus]}</Badge>
            </div>
            {!isVisibleOnSelectedDate && (
                <StatusMessage title="Not on this board" tone="info">
                    This task starts after {formatLocalDateLong(selectedDate)}, so it is not shown
                    on this date.
                </StatusMessage>
            )}
            <dl className="m-0 grid grid-cols-1 gap-3 sm:grid-cols-[8rem_1fr]">
                <dt className="font-medium text-muted-foreground">Start date</dt>
                <dd className="m-0 text-foreground">{formatLocalDateLong(record.startDate)}</dd>
                <dt className="font-medium text-muted-foreground">Details</dt>
                <dd className="m-0 break-words whitespace-pre-wrap text-foreground">
                    {record.details ?? <span className="text-muted-foreground">No details</span>}
                </dd>
            </dl>
            <div className="flex justify-end">
                <Button onClick={onEdit} variant="outline">
                    <Pencil aria-hidden="true" data-icon="inline-start" />
                    Edit
                </Button>
            </div>
        </div>
    );
}
