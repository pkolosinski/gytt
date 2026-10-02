import { Dialog } from '@base-ui/react/dialog';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/generated/shadcn/ui/button.tsx';

import type { TaskView } from '../models/task.ts';

interface TaskCompletionDialogProps {
    isPending: boolean;
    onCancel: () => void;
    onConfirm: (task: TaskView) => void;
    task: TaskView | null;
}

export function TaskCompletionDialog({
    isPending,
    onCancel,
    onConfirm,
    task,
}: TaskCompletionDialogProps) {
    const { t } = useTranslation();

    return (
        <Dialog.Root
            onOpenChange={(open) => {
                if (!open && !isPending) {
                    onCancel();
                }
            }}
            open={task !== null}
        >
            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-[60] bg-black/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
                <Dialog.Popup
                    className="fixed top-1/2 left-1/2 z-[60] flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-xl bg-popover p-5 text-left text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none"
                    role="alertdialog"
                >
                    {task !== null && (
                        <Dialog.Title className="font-heading m-0 text-xl font-medium text-foreground">
                            {t('tasks.completion.title', { title: task.title })}
                        </Dialog.Title>
                    )}
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button disabled={isPending} onClick={onCancel} variant="outline">
                            {t('tasks.completion.no')}
                        </Button>
                        <Button
                            disabled={isPending || task === null}
                            onClick={() => {
                                if (task !== null) {
                                    onConfirm(task);
                                }
                            }}
                        >
                            {t('tasks.completion.yes')}
                        </Button>
                    </div>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
