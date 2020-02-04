export declare const appendId: <FormArrayValues extends {
  id?: string | undefined;
} & Record<string, any> = Record<string, any>>(
  value: FormArrayValues,
) =>
  | (FormArrayValues & {
      id: string;
    })
  | {
      id: string;
      value: never;
    };
export declare const mapIds: (data: any) => any[];
