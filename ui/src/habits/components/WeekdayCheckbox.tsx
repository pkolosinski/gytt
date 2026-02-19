import { Checkbox } from 'radix-ui';

import type { Weekday } from '@/types/datetime';

import { Field, FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';

interface Props {
  fieldname: string;
  state: Weekday[];
  onChange: (value: Weekday[]) => void;
}

export const WeekdayCheckbox = ({ fieldname, state, onChange }: Props) => {
  const days: { day: Weekday; label: string }[] = [
    { day: 'monday', label: 'Pn' },
    { day: 'tuesday', label: 'Wt' },
    { day: 'wednesday', label: 'Śr' },
    { day: 'thursday', label: 'Czw' },
    { day: 'friday', label: 'Pt' },
    { day: 'saturday', label: 'Sb' },
    { day: 'sunday', label: 'Nd' },
  ];
  const handleCheckedChange = (
    checked: Checkbox.CheckedState,
    day: Weekday
  ) => {
    if (checked) {
      onChange([...state, day]);
    } else {
      onChange(state.filter((it) => it !== day));
    }
  };

  return (
    <Field className="col-span-full">
      <FieldLabel htmlFor={fieldname}>Dni tygodnia</FieldLabel>
      <Field orientation="horizontal" className="justify-center gap-4">
        {days.map(({ day, label }) => (
          <Checkbox.Root
            key={day}
            checked={state?.includes(day)}
            onCheckedChange={(checked) => handleCheckedChange(checked, day)}
            className={cn(
              'bg-secondary size-9 cursor-pointer rounded-full border text-sm',
              'data-[state=checked]:border-primary',
              'data-[state=checked]:bg-primary',
              'data-[state=checked]:text-primary-foreground'
            )}
          >
            {label}
          </Checkbox.Root>
        ))}
      </Field>
    </Field>
  );
};
