import { FieldValues, SchemaValidateOptions, FieldErrors } from '../types';
declare type SchemaValidationResult<FormValues> = {
  errors: FieldErrors<FormValues>;
  values: FieldValues;
};
declare type YupValidationError = {
  inner: {
    path: string;
    message: string;
    type: string;
  }[];
  path: string;
  message: string;
  type: string;
};
declare type Schema<Data> = {
  validate(value: FieldValues, options?: SchemaValidateOptions): Promise<Data>;
};
export declare const parseErrorSchema: <FormValues>(
  error: YupValidationError,
  validateAllFieldCriteria: boolean,
) => import('../types').NestDataObject<FormValues>;
export default function validateWithSchema<FormValues>(
  validationSchema: Schema<FormValues>,
  validateAllFieldCriteria: boolean,
  data: FieldValues,
): Promise<SchemaValidationResult<FormValues>>;
export {};
