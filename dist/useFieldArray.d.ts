import { FieldValues, Control, UseFieldArrayProps, WithFieldId } from './types';
export declare function useFieldArray<
  FormArrayValues extends FieldValues = FieldValues,
  ControlProp extends Control = Control
>({
  control,
  name,
}: UseFieldArrayProps<ControlProp>): {
  swap: (indexA: number, indexB: number) => void;
  move: (from: number, to: number) => void;
  prepend: (
    value:
      | WithFieldId<Partial<FormArrayValues>>
      | WithFieldId<Partial<FormArrayValues>>[],
  ) => void;
  append: (
    value:
      | WithFieldId<Partial<FormArrayValues>>
      | WithFieldId<Partial<FormArrayValues>>[],
  ) => void;
  remove: (index?: number | undefined) => void;
  insert: (
    index: number,
    value:
      | WithFieldId<Partial<FormArrayValues>>
      | WithFieldId<Partial<FormArrayValues>>[],
  ) => void;
  fields: WithFieldId<Partial<FormArrayValues>>[];
};
