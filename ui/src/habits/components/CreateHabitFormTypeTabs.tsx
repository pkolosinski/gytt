import { Field, FieldLabel } from '@/components/ui/field';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { HabitType } from '../types/habits';

interface Props {
  fieldname: string;
  value: HabitType;
  onChange: (value: HabitType) => void;
}

export const CreateHabitFormTypeTabs = ({
  fieldname,
  value,
  onChange,
}: Props) => {
  const options: { type: HabitType; label: string }[] = [
    { type: 'daily', label: 'Dziennie' },
    { type: 'weekly', label: 'Tygodniowo' },
  ];
  const handleChange = (val: string) => {
    onChange(val as HabitType);
  };

  return (
    <Field>
      <FieldLabel htmlFor={fieldname}>Częstotliwość</FieldLabel>
      <Tabs
        id={fieldname}
        defaultValue="daily"
        value={value}
        onValueChange={handleChange}
      >
        <TabsList className="w-full">
          {options.map(({ type, label }) => (
            <TabsTrigger key={type} value={type}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </Field>
  );
};
