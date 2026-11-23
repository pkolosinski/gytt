import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from 'cn';

import { Checkbox } from '@/shared/generated/shadcn/ui/checkbox.tsx';
import type { TaskListStep } from '../models/task.ts';

interface TaskStepListProps {
  steps?: readonly TaskListStep[];
  disabled?: boolean;
  onToggle?: (index: number, completed: boolean) => void;
}

export function TaskStepList({ steps, disabled = false, onToggle }: TaskStepListProps) {
  const { t } = useTranslation('tasks');
  const idPrefix = useId();

  if (steps === undefined || steps.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <span className="text-xs font-medium text-muted-foreground">{t('steps.title')}</span>
      <ul aria-label={t('steps.listLabel')} className="m-0 flex list-none flex-col gap-1 p-0">
        {steps.map((step, index) => {
          const id = `${idPrefix}-step-${index}`;
          return (
            <li
              className="relative z-10 flex min-w-0 items-start gap-2"
              key={`${index}-${step.name}`}
            >
              <Checkbox
                aria-label={t('steps.checkboxLabel', { text: step.name })}
                checked={step.completed}
                className="mt-0.5"
                disabled={disabled}
                id={id}
                onCheckedChange={(checked) => onToggle?.(index, checked)}
              />
              <label
                className={cn(
                  'min-w-0 break-words',
                  step.completed ? 'text-muted-foreground line-through' : 'text-foreground',
                )}
                htmlFor={id}
              >
                {step.name}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
