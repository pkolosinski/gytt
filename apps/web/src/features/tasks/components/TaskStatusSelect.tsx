import { useTranslation } from 'react-i18next';

import { Select as SelectPrimitive } from '@base-ui/react/select';
import { cn } from 'cn';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/shared/generated/shadcn/ui/select.tsx';
import { TASK_STATUSES, type TaskStatus } from '../models/task.ts';
import { TaskStatusIcon } from './TaskStatusIcon.tsx';

interface TaskStatusSelectProps {
  value: TaskStatus;
  /** Names the control for assistive technology. */
  label: string;
  onChange: (status: TaskStatus) => void;
  disabled?: boolean;
  className?: string;
}

/** A status pill that opens a list of statuses to pick another one. */
export function TaskStatusSelect({
  value,
  label,
  onChange,
  disabled,
  className,
}: TaskStatusSelectProps) {
  const { t } = useTranslation('tasks');
  const items = TASK_STATUSES.map((status) => ({ label: t(`status.${status}`), value: status }));

  return (
    <Select
      disabled={disabled}
      items={items}
      onValueChange={(status) => status && onChange(status)}
      value={value}
    >
      <SelectPrimitive.Trigger
        aria-label={label}
        className={cn(
          'inline-flex h-9 w-fit cursor-pointer items-center gap-1.5 rounded-full bg-secondary px-3 text-sm font-medium whitespace-nowrap text-secondary-foreground transition-colors outline-none select-none hover:bg-secondary/70 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 lg:h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0',
          className,
        )}
      >
        <SelectValue className="flex-none items-center gap-1.5">
          {(status: TaskStatus) => (
            <>
              <TaskStatusIcon status={status} />
              {t(`status.${status}`)}
            </>
          )}
        </SelectValue>
      </SelectPrimitive.Trigger>
      <SelectContent align="end" alignItemWithTrigger={false}>
        {items.map((item) => (
          <SelectItem className="min-h-9 lg:min-h-0" key={item.value} value={item.value}>
            <TaskStatusIcon status={item.value} />
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
