import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm } from '@tanstack/react-form';
import { PlusIcon, XIcon } from 'lucide-react';

import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/generated/shadcn/ui/dialog.tsx';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/shared/generated/shadcn/ui/field.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/shared/generated/shadcn/ui/input-group.tsx';
import { Input } from '@/shared/generated/shadcn/ui/input.tsx';
import { Textarea } from '@/shared/generated/shadcn/ui/textarea.tsx';
import {
  createTaskFormSchema,
  toTaskFields,
  type TaskFields,
  type TaskFormValues,
} from '../models/task-form.ts';
import { TaskStatusSelect } from './TaskStatusSelect.tsx';

interface Props {
  open: boolean;
  heading: string;
  description: string;
  submitLabel: string;
  initialValues: TaskFormValues;
  isPending: boolean;
  isError: boolean;
  onSubmit: (fields: TaskFields) => void;
  onClose: () => void;
}

/** The Task form in a modal, shared by creating and editing. */
export function TaskFormDialog({ open, onClose, ...formProps }: Props) {
  return (
    <Dialog onOpenChange={(next) => !next && onClose()} open={open}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <TaskForm onClose={onClose} {...formProps} />
      </DialogContent>
    </Dialog>
  );
}

type FormProps = Omit<Props, 'open'>;

function TaskForm({
  heading,
  description,
  submitLabel,
  initialValues,
  isPending,
  isError,
  onSubmit,
  onClose,
}: FormProps) {
  const { t } = useTranslation('tasks');
  const schema = useMemo(() => createTaskFormSchema(t), [t]);

  const form = useForm({
    defaultValues: initialValues,
    validators: { onChange: schema, onSubmit: schema },
    onSubmit: ({ value }) => onSubmit(toTaskFields(schema.parse(value))),
  });

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <DialogHeader>
        <DialogTitle>{heading}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <form.Field name="title">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{t('editor.title')}</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  autoComplete="off"
                  autoFocus
                  disabled={isPending}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="description">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{t('editor.description')}</FieldLabel>
                <Textarea
                  aria-invalid={isInvalid}
                  disabled={isPending}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field mode="array" name="steps">
          {(stepsField) => (
            <FieldSet>
              <FieldLegend variant="label">{t('steps.title')}</FieldLegend>
              {stepsField.state.value.length > 0 && (
                <FieldGroup className="gap-2">
                  {stepsField.state.value.map((_, index) => (
                    <form.Field key={index} name={`steps[${index}].name`}>
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                        const number = index + 1;
                        return (
                          <Field data-invalid={isInvalid}>
                            <InputGroup>
                              <InputGroupInput
                                aria-invalid={isInvalid}
                                aria-label={t('steps.editorLabel', { number })}
                                autoComplete="off"
                                disabled={isPending}
                                id={`step-${index}`}
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={(event) => field.handleChange(event.target.value)}
                                value={field.state.value}
                              />
                              <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                  aria-label={t('steps.remove', { number })}
                                  disabled={isPending}
                                  onClick={() => stepsField.removeValue(index)}
                                  size="icon-xs"
                                >
                                  <XIcon aria-hidden="true" />
                                </InputGroupButton>
                              </InputGroupAddon>
                            </InputGroup>
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        );
                      }}
                    </form.Field>
                  ))}
                </FieldGroup>
              )}
              <form.Subscribe selector={(state) => state.values.steps}>
                {(steps) => (
                  <Button
                    className="self-start"
                    disabled={isPending || steps.some(({ name }) => name.trim() === '')}
                    onClick={() => stepsField.pushValue({ name: '', completed: false })}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <PlusIcon aria-hidden="true" />
                    {t('steps.add')}
                  </Button>
                )}
              </form.Subscribe>
            </FieldSet>
          )}
        </form.Field>
      </FieldGroup>
      {isError && (
        <p className="m-0 text-sm text-destructive" role="alert">
          {t('editor.saveUnavailable')}
        </p>
      )}
      <DialogFooter>
        <form.Field name="status">
          {(field) => (
            <TaskStatusSelect
              className="w-full sm:mr-auto sm:w-fit"
              disabled={isPending}
              label={t('statusSelect.field')}
              onChange={field.handleChange}
              value={field.state.value}
            />
          )}
        </form.Field>
        <Button disabled={isPending} onClick={onClose} type="button" variant="outline">
          {t('column.cancel')}
        </Button>
        <Button disabled={isPending} type="submit">
          {isPending ? t('editor.saving') : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
