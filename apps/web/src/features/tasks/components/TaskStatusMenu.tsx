import { useEffect, useRef, type MouseEvent } from 'react';

import { Menu } from '@base-ui/react/menu';
import { Check, ChevronDown, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { TASK_STATUSES, type TaskStatus, type TaskView } from '../models/task.ts';
import { TaskStatusIcon } from './TaskStatusIcon.tsx';

interface TaskStatusMenuProps {
    isPending: boolean;
    onFocused: () => void;
    onMove: (task: TaskView, status: TaskStatus) => void;
    /** Focuses the status control after the task moves to another column. */
    shouldFocus: boolean;
    task: TaskView;
}

// Menu events bubble through the portal to the draggable card; keep them from starting a drag.
function stopDrag(event: MouseEvent) {
    event.stopPropagation();
}

/** The status chip in Task details; the keyboard- and touch-friendly Move action. */
export function TaskStatusMenu({
    isPending,
    onFocused,
    onMove,
    shouldFocus,
    task,
}: TaskStatusMenuProps) {
    const { t } = useTranslation();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const label = t(`tasks.status.${task.status}`);

    useEffect(() => {
        if (shouldFocus) {
            triggerRef.current?.focus();
            onFocused();
        }
    }, [onFocused, shouldFocus]);

    return (
        <Menu.Root>
            <Menu.Trigger
                aria-label={t('tasks.statusMenu.trigger', { status: label, title: task.title })}
                className="relative z-10 inline-flex h-8 shrink-0 items-center gap-1 rounded-full border bg-background px-2 text-xs font-medium text-foreground transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
                onMouseDown={stopDrag}
                ref={triggerRef}
            >
                <TaskStatusIcon className="size-3.5" status={task.status} />
                {label}
                {isPending ? (
                    <LoaderCircle aria-hidden="true" className="size-3 animate-spin" />
                ) : (
                    <ChevronDown aria-hidden="true" className="size-3 text-muted-foreground" />
                )}
            </Menu.Trigger>
            <Menu.Portal>
                <Menu.Positioner align="start" className="z-50 outline-none" sideOffset={4}>
                    <Menu.Popup
                        className="min-w-44 origin-(--transform-origin) rounded-lg bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 transition duration-100 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
                        onMouseDown={stopDrag}
                    >
                        <Menu.Group>
                            <Menu.GroupLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                {t('tasks.statusMenu.moveTo')}
                            </Menu.GroupLabel>
                            <Menu.RadioGroup
                                disabled={isPending}
                                onValueChange={(value) => {
                                    const status = TASK_STATUSES.find(
                                        (candidate) => candidate === value,
                                    );
                                    if (status !== undefined && status !== task.status) {
                                        onMove(task, status);
                                    }
                                }}
                                value={task.status}
                            >
                                {TASK_STATUSES.map((status) => (
                                    <Menu.RadioItem
                                        className="flex min-h-9 cursor-default items-center gap-2 rounded-md px-2 py-1.5 outline-none select-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground sm:min-h-8"
                                        closeOnClick
                                        key={status}
                                        value={status}
                                    >
                                        <TaskStatusIcon status={status} />
                                        {t(`tasks.status.${status}`)}
                                        <Menu.RadioItemIndicator className="ml-auto">
                                            <Check aria-hidden="true" className="size-4" />
                                        </Menu.RadioItemIndicator>
                                    </Menu.RadioItem>
                                ))}
                            </Menu.RadioGroup>
                        </Menu.Group>
                    </Menu.Popup>
                </Menu.Positioner>
            </Menu.Portal>
        </Menu.Root>
    );
}
