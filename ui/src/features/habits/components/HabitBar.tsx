import { ProgressBar } from '@shared/components/progress';
import { Badge } from '@shared/components/shadcn/ui/badge';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@shared/components/shadcn/ui/item';

import type { Habit } from '../types/habits';

import { calculateProgress } from '../utils/calculate-progress';

interface Props {
  habit: Habit;
}

export const HabitBar = ({ habit }: Props) => {
  const progressPercentage = (habit.completed / habit.goal) * 100;
  return (
    <Item variant="outline" className="grid overflow-hidden p-0">
      <ProgressBar value={progressPercentage} />
      <ItemContent className="z-10 col-start-1 row-start-1 p-4">
        <ItemTitle className="text-sm font-semibold">
          {habit.name}
          <Badge variant="outline" className="h-4 w-10">
            {calculateProgress(habit)}
          </Badge>
        </ItemTitle>
        <ItemDescription className="text-xs">
          {`${habit.completed}/${habit.goal} ${habit.unit ?? ''}`}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
};
