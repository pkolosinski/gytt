import { cn } from '@shared/utils/utils';
import { Progress } from 'radix-ui';

import { useProgress } from './useProgress';

interface Props {
  value: number;
  className?: string;
  color?: string;
  indicatorColor?: string;
}

export const ProgressBar = ({
  value,
  className,
  color = 'bg-secondary/20',
  indicatorColor = 'bg-secondary',
}: Props) => {
  const { progress } = useProgress(value);
  return (
    <Progress.Root
      data-slot="progress"
      className={cn(
        color,
        'col-start-1 row-start-1 h-full w-full rounded-none',
        className
      )}
      value={Math.min(progress, 100)}
    >
      <Progress.Indicator
        data-slot="progress-indicator"
        className={`${indicatorColor} h-full w-full flex-1 transition-all`}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </Progress.Root>
  );
};
