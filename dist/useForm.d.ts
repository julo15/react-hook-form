import { FormContextValues } from './contextTypes';
import { FieldValues, UseFormOptions } from './types';
export declare function useForm<FormValues extends FieldValues = FieldValues>({
  mode,
  reValidateMode,
  validationSchema,
  defaultValues,
  submitFocusError,
  validateCriteriaMode,
}?: UseFormOptions<FormValues>): FormContextValues<FormValues>;
