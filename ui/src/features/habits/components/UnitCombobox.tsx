/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DeepKeys, DeepValue, FieldApi } from '@tanstack/react-form';

import { Combobox as ComboboxPrimitive } from '@base-ui/react';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from '@shared/components/shadcn/ui/combobox';
import { Field, FieldLabel } from '@shared/components/shadcn/ui/field';
import { type RefObject } from 'react';

import { UNITS } from '../types/habits';

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
  containerRef?: RefObject<null>;
}

export const UnitCombobox = <
  TParentData,
  TName extends DeepKeys<TParentData>,
  TData extends DeepValue<TParentData, TName>,
>({
  field,
  label,
  containerRef,
}: Props<TParentData, TName, TData>) => (
  <Field>
    <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
    <Combobox
      items={UNITS}
      onInputValueChange={(val) => field.handleChange(val as TData)}
    >
      <ComboboxInput
        id={field.name}
        name={field.name}
        value={field.state.value as string}
        onBlur={field.handleBlur}
        showClear
      />
      <ComboboxPrimitive.Portal container={containerRef}>
        <ComboboxContent>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </ComboboxPrimitive.Portal>
    </Combobox>
  </Field>
);
