import { useTranslation } from 'react-i18next';

import type { TaskView } from '../models/task.ts';

interface TaskStepListProps {
    isPending?: boolean;
    onToggleStep?: (
        task: TaskView,
        stepId: string,
        isCompleted: boolean,
    ) => Promise<TaskView | null>;
    task: TaskView;
}

export function TaskStepList({ isPending = false, onToggleStep, task }: TaskStepListProps) {
    const { t } = useTranslation();

    if (task.steps.length === 0) {
        return null;
    }

    async function toggleStep(stepId: string, isCompleted: boolean) {
        if (onToggleStep === undefined) {
            return;
        }
        await onToggleStep(task, stepId, isCompleted);
    }

    return (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
            <span className="text-xs font-medium text-muted-foreground">
                {t('tasks.steps.title')}
            </span>
            <ul
                aria-label={t('tasks.steps.listLabel')}
                className="m-0 flex list-none flex-col gap-1 p-0"
            >
                {task.steps.map((step) => {
                    const disabled =
                        task.status === 'completed' || isPending || onToggleStep === undefined;
                    return (
                        <li key={step.id}>
                            <label
                                className="flex min-w-0 cursor-pointer items-start gap-2 rounded-sm text-sm outline-none focus-within:ring-2 focus-within:ring-ring/50"
                                onPointerDown={(event) => event.stopPropagation()}
                                onMouseDown={(event) => event.stopPropagation()}
                            >
                                <input
                                    aria-label={t('tasks.steps.checkboxLabel', {
                                        text: step.text,
                                    })}
                                    checked={step.isCompleted}
                                    className="pointer-events-auto mt-0.5 size-4 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
                                    data-task-step-id={step.id}
                                    disabled={disabled}
                                    onChange={(event) =>
                                        void toggleStep(step.id, event.currentTarget.checked)
                                    }
                                    onPointerDown={(event) => event.stopPropagation()}
                                    onMouseDown={(event) => event.stopPropagation()}
                                    type="checkbox"
                                />
                                <span
                                    className={
                                        step.isCompleted
                                            ? 'min-w-0 break-words text-muted-foreground line-through'
                                            : 'min-w-0 break-words text-foreground'
                                    }
                                >
                                    {step.text}
                                </span>
                            </label>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
