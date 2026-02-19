import { Badge } from '@/components/ui/badge';
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '@/components/ui/item';

import type { Habit } from '../types/habits';

import { calculateProgress } from '../utils/calculate-progress';

interface Props {
  habit: Habit;
}

export const HabitBar = ({ habit }: Props) => (
  <Item variant="outline">
    <ItemContent>
      <ItemTitle className="text font-semibold">
        <div className="flex gap-2">
          {habit.name}
          {'\t'}
          <Badge variant="outline" className="h-4 w-10">
            {calculateProgress(habit)}
          </Badge>
        </div>
      </ItemTitle>
      <ItemDescription>
        {`${habit.completed}/${habit.goal} ${habit.unit ?? ''}`}
      </ItemDescription>
    </ItemContent>
    <ItemActions>{/* <CreateHabitDialog /> */}</ItemActions>
  </Item>
);
