import { Separator } from '@shared/components/shadcn/ui/separator';

import { useHabits } from '../hooks/useHabits';
import { CreateHabitDialogForm } from './CreateHabitDialogForm';
import { HabitItemGroup } from './HabitItemGroup';
import { SelectDateButtonGroup } from './SelectDateButtonGroup';

export const HabitList = () => {
  const {dailyHabits, weeklyHabits} = useHabits()
  return (
    <main className="flex flex-col gap-4 p-8">
      <div>
        <h1 className="text-3xl font-extrabold">Moje nawyki</h1>
      </div>
      <div className="bg-secondary flex w-fit gap-4 rounded-md p-2">
        <SelectDateButtonGroup variant="ghost" />
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
