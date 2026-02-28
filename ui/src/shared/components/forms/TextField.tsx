/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DeepKeys, DeepValue, FieldApi } from '@tanstack/react-form';
import type { ChangeEventHandler } from 'react';

import {
  Field,
  FieldError,
  FieldLabel,
} from '@shared/components/shadcn/ui/field';
import { Input } from '@shared/components/shadcn/ui/input';

interface Props<
  TParentData,
  TName extends DeepKeys<TParentData>,
  TData extends DeepValue<TParentData, TName>,
> {
  field: FieldApi<
    TParentData,
    TName,
    TData,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
  label: string;
  onChange?: ChangeEventHandler<HTMLInputElement, HTMLInputElement>;
}

export const TextField = <
  TParentData,
  TName extends DeepKeys<TParentData>,
  TData extends DeepValue<TParentData, TName>,
>({
  field,
  label,
  onChange = (e) => field.handleChange(e.target.value as TData),
}: Props<TParentData, TName, TData>) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value as string}
        onBlur={field.handleBlur}
        onChange={onChange}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
};
