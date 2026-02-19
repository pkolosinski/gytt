import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ItemGroup } from '@/components/ui/item';

import type { Habit } from '../types/habits';

import { HabitBar } from './HabitBar';

interface Props {
  title: string;
  habits: Habit[];
}

export const HabitItemGroup = ({ title, habits }: Props) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <ItemGroup className="gap-2">
          {habits.map((habit) => (
            <HabitBar key={habit.id} habit={habit} />
          ))}
        </ItemGroup>
      </CollapsibleContent>
    </Collapsible>
  );
};
