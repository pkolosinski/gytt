import { useForm } from '@tanstack/react-form';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { defaultHabitInput, habitInputSchema, UNITS } from '../types/habits';
import { CreateHabitFormTypeTabs } from './CreateHabitFormTypeTabs';
import { WeekdayCheckbox } from './WeekdayCheckbox';

export const CreateHabitDialogForm = () => {
  const form = useForm({
    defaultValues: defaultHabitInput,
    validators: {
      onBlur: habitInputSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(`You submited ${JSON.stringify(value)}`);
    },
  });

  return (
    <Dialog>
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
        <DialogContent
          className="w-110 gap-8"
          onInteractOutside={(e) => {
            // Allow interaction with Base UI combobox popup
            if ((e.target as HTMLElement)?.closest('[data-base-ui-popup]')) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Dodaj nowy nawyk</DialogTitle>
          </DialogHeader>
          <FieldGroup className="gap-6">
            <form.Field
              name="name"
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Nazwa</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Field>
                );
              }}
            />
            <form.Field
              name="description"
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Opis</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Field>
                );
              }}
            />
            <FieldSet className="grid grid-cols-[25%_25%_1fr] gap-2">
              <FieldLegend>Cel</FieldLegend>
              <form.Field
                name="goal"
                children={(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Wartość</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(parseFloat(e.target.value))
                        }
                        required
                      />
                    </Field>
                  );
                }}
              />
              <form.Field
                name="unit"
                children={(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Jednostka</FieldLabel>
                      <Combobox
                        items={UNITS}
                        modal={true}
                        onInputValueChange={(e) => field.handleChange(e)}
                      >
                        <ComboboxInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          showClear
                        />
                        <ComboboxContent>
                          <ComboboxList>
                            {(item) => (
                              <ComboboxItem key={item} value={item}>
                                {item}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </Field>
                  );
                }}
              />
              <form.Field
                name="type"
                listeners={{
                  onChange: ({ value }) => {
                    if (value === 'daily') {
                      form.setFieldValue(
                        'weekdays',
                        defaultHabitInput.weekdays
                      );
                    } else {
                      form.setFieldValue('weekdays', undefined);
                    }
                  },
                }}
                children={(field) => {
                  return (
                    <CreateHabitFormTypeTabs
                      fieldname={field.name}
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                    />
                  );
                }}
              />
              <form.Field
                name="weekdays"
                children={(field) => {
                  return (
                    field.state.value && (
                      <WeekdayCheckbox
                        fieldname={field.name}
                        state={field.state.value}
                        onChange={(value) => field.handleChange(value)}
                      />
                    )
                  );
                }}
              />
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
