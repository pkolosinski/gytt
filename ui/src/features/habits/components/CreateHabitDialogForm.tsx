import { TextField } from '@shared/components/forms';
import { Button } from '@shared/components/shadcn/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared/components/shadcn/ui/dialog';
import {
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@shared/components/shadcn/ui/field';
import { useForm } from '@tanstack/react-form';
import { Plus } from 'lucide-react';
import { useRef, useState } from 'react';

import {
  defaultHabitInput,
  habitInputSchema,
  type HabitType,
} from '../types/habits';
import { HabitTypeTabs } from './HabitTypeTabs';
import { UnitCombobox } from './UnitCombobox';
import { WeekdayCheckbox } from './WeekdayCheckbox';

export const CreateHabitDialogForm = () => {
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: defaultHabitInput,
    validators: {
      onBlur: habitInputSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(`You submited ${JSON.stringify(value)}`);
      setOpen(false);
    },
  });

  const handleTypeChange = ({ value }: { value: HabitType }) => {
    if (value === 'daily') {
      form.setFieldValue('weekdays', defaultHabitInput.weekdays);
    } else {
      form.setFieldValue('weekdays', undefined);
    }
  };

  const contentRef = useRef(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form
        id="create-habit-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="bg-inherit">
            <Plus />
            Nowy nawyk
          </Button>
        </DialogTrigger>
        <DialogContent ref={contentRef} className="w-110 gap-8">
          <DialogHeader>
            <DialogTitle>Dodaj nowy nawyk</DialogTitle>
          </DialogHeader>
          <FieldGroup className="gap-6">
            <form.Field name="name">
              {(field) => <TextField field={field} label="Nazwa" />}
            </form.Field>
            <form.Field name="description">
              {(field) => <TextField field={field} label="Opis" />}
            </form.Field>
            <FieldSet className="grid grid-cols-[25%_25%_1fr] gap-x-2">
              <FieldLegend>Cel</FieldLegend>
              <form.Field name="goal">
                {(field) => (
                  <TextField
                    field={field}
                    label="Wartość"
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value) || 0)
                    }
                  />
                )}
              </form.Field>
              <form.Field name="unit">
                {(field) => (
                  <UnitCombobox
                    field={field}
                    label="Jednostka"
                    containerRef={contentRef}
                  />
                )}
              </form.Field>
              <form.Field
                name="type"
                listeners={{ onChange: handleTypeChange }}
              >
                {(field) => (
                  <HabitTypeTabs
                    fieldname={field.name}
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                  />
                )}
              </form.Field>
              <form.Field name="weekdays">
                {(field) =>
                  field.state.value && (
                    <WeekdayCheckbox
                      fieldname={field.name}
                      state={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                    />
                  )
                }
              </form.Field>
            </FieldSet>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Anuluj</Button>
            </DialogClose>
            <Button type="submit" form="create-habit-form">
              Zapisz
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};
