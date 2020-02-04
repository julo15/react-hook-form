import { Field, FieldRefs, FieldValues } from '../types';
export default function findRemovedFieldAndRemoveListener<
  FormValues extends FieldValues
>(
  fields: FieldRefs<FormValues>,
  handleChange: ({ type, target }: MouseEvent) => Promise<void | boolean>,
  field: Field,
  forceDelete?: boolean,
): void;
