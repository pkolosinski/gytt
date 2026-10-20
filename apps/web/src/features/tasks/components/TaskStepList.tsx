import { useTranslation } from 'react-i18next';

import { Check, Circle } from 'lucide-react';

import type { TaskListStep } from '../models/task.ts';

interface TaskStepListProps {
  steps?: readonly TaskListStep[];
}

export function TaskStepList({ steps }: TaskStepListProps) {
  const { t } = useTranslation('tasks');

  if (steps === undefined || steps.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <span className="text-xs font-medium text-muted-foreground">{t('steps.title')}</span>
      <ul aria-label={t('steps.listLabel')} className="m-0 flex list-none flex-col gap-1 p-0">
        {steps.map((step, index) => (
          <li key={`${index}-${step.name}`}>
            <div className="flex min-w-0 items-start gap-2">
              {step.completed ? (
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
              ) : (
                <Circle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
              )}
              <span
                className={
                  step.completed
                    ? 'min-w-0 break-words text-muted-foreground line-through'
                    : 'min-w-0 break-words text-foreground'
                }
              >
                {step.name}
              </span>
              <span className="sr-only">
                {t(step.completed ? 'steps.completedStatus' : 'steps.incompleteStatus')}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
