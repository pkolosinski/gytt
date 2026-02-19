import { Separator } from '@/components/ui/separator';

import type { Habit } from './types/habits';

import { ChooseDateButtonGroup } from './components/ChooseDateButtonGroup';
import { CreateHabitDialogForm } from './components/CreateHabitDialogForm';
import { HabitItemGroup } from './components/HabitItemGroup';

const dailyHabits: Habit[] = [
  {
    id: 1,
    name: 'Picie wody',
    goal: 2,
    completed: 1.5,
    unit: 'l',
    type: 'daily',
  },
  {
    id: 2,
    name: 'Czytanie',
    goal: 20,
    completed: 35,
    unit: 'min',
    type: 'daily',
  },
  {
    id: 3,
    name: 'Ćwiczenia',
    goal: 30,
    completed: 10,
    unit: 'min',
    type: 'daily',
  },
  {
    id: 4,
    name: 'Kroki',
    goal: 10000,
    completed: 5600,
    type: 'daily',
  },
];

const weeklyHabits: Habit[] = [
  {
    id: 1,
    name: 'Trening',
    goal: 2,
    completed: 1,
    unit: 'razy',
    type: 'weekly',
  },
];

export const Habits = () => {
  return (
    <main className="flex flex-col gap-4 p-8">
      <div>
        <h1 className="text-3xl font-extrabold">Moje nawyki</h1>
      </div>
      <div className="bg-secondary flex w-fit gap-4 rounded-md p-2">
        <ChooseDateButtonGroup variant="ghost" />
        <Separator orientation="vertical" />
        <CreateHabitDialogForm />
      </div>
      <div className="flex flex-col gap-6">
        <HabitItemGroup title={'Dzienne nawyki'} habits={dailyHabits} />
        <Separator />
        <HabitItemGroup title={'Tygodniowe nawyki'} habits={weeklyHabits} />
      </div>
    </main>
  );
};
