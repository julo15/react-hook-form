import * as React from 'react';
import { useFormContext } from './useFormContext';
import { isMatchFieldArrayName } from './logic/isNameInFieldArray';
import getFieldValueByName from './logic/getFieldValueByName';
import { appendId, mapIds } from './logic/mapIds';
import getIsFieldsDifferent from './logic/getIsFieldsDifferent';
import get from './utils/get';
import isUndefined from './utils/isUndefined';
import removeArrayAt from './utils/remove';
import moveArrayAt from './utils/move';
import swapArrayAt from './utils/swap';
import prependAt from './utils/prepend';
import isArray from './utils/isArray';
import insertAt from './utils/insert';
import fillEmptyArray from './utils/fillEmptyArray';
import {
  FieldValues,
  Control,
  UseFieldArrayProps,
  WithFieldId,
  Field,
} from './types';

const { useEffect, useRef, useState } = React;

const breakFieldArrayName = (
  name: string,
  searchName: string,
): { prefix: string; index: number; suffix: string } | undefined => {
  const prefix = `${searchName}[`;
  if (!name.startsWith(prefix)) {
    return;
  }

  const startIndex = prefix.length;
  const endIndex = name.indexOf(']', startIndex);
  const index = Number(name.substring(startIndex, endIndex));
  const suffix = name.substring(endIndex);
  return {
    index,
    prefix,
    suffix,
  };
};

const decrementIndex = (name: string, searchName: string): string => {
  const breakdown = breakFieldArrayName(name, searchName);
  if (!breakdown) {
    throw new Error('Invalid array field name');
  }
  const { index, prefix, suffix } = breakdown;
  return `${prefix}${index - 1}${suffix}`;
};

export function useFieldArray<
  FormArrayValues extends FieldValues = FieldValues,
  ControlProp extends Control = Control
>({ control, name }: UseFieldArrayProps<ControlProp>) {
  const methods = useFormContext();
  const {
    resetFieldArrayFunctionRef,
    fieldArrayNamesRef,
    fieldsRef,
    getValues,
    defaultValuesRef,
    removeFieldEventListener,
    errorsRef,
    isDirtyRef,
    touchedFieldsRef,
    readFormStateRef,
    watchFieldArrayRef,
  } = control || methods.control;
  const memoizedDefaultValues = useRef(get(defaultValuesRef.current, name, []));
  const [fields, setField] = useState<WithFieldId<Partial<FormArrayValues>>[]>(
    mapIds(memoizedDefaultValues.current),
  );

  const resetFields = (
    flagOrFields?: WithFieldId<Partial<FormArrayValues>>[],
  ) => {
    if (readFormStateRef.current.dirty) {
      isDirtyRef.current = isUndefined(flagOrFields)
        ? true
        : getIsFieldsDifferent(flagOrFields, memoizedDefaultValues.current);
    }

    for (const key in fieldsRef.current) {
      if (isMatchFieldArrayName(key, name) && fieldsRef.current[key]) {
        removeFieldEventListener(fieldsRef.current[key] as Field, true);
      }
    }
  };

  const removeFromFields = (index?: number) => {
    if (index === undefined) {
      return;
    }

    // First remove at the index
    let lastIndex: number | undefined = undefined;
    for (const key in fieldsRef.current) {
      if (isMatchFieldArrayName(key, name) && fieldsRef.current[key]) {
        const i = breakFieldArrayName(key, name)!.index;
        if (i === index) {
          removeFieldEventListener(fieldsRef.current[key] as Field, true);
        }
        lastIndex = lastIndex === undefined || i > lastIndex ? i : lastIndex;
      }
    }
    for (let i = index + 1; i <= lastIndex!; i++) {
      // Remove field i
      for (const key in fieldsRef.current) {
        if (isMatchFieldArrayName(key, name) && fieldsRef.current[key]) {
          const j = breakFieldArrayName(key, name)!.index;
          if (i === j) {
            // Update the index of the ref and delete the old index.
            const updatedKey = decrementIndex(key, name);
            fieldsRef.current[updatedKey] = fieldsRef.current[key];
            if (fieldsRef.current[updatedKey]?.ref?.name === key) {
              fieldsRef.current[updatedKey]!.ref.name = updatedKey;
            }
            delete fieldsRef.current[key];
          }
        }
      }
    }
  };

  const mapCurrentFieldsValueWithState = () => {
    const currentFieldsValue = getValues({ nest: true })[name];

    if (isArray(currentFieldsValue)) {
      for (let i = 0; i < currentFieldsValue.length; i++) {
        fields[i] = {
          ...fields[i],
          ...currentFieldsValue[i],
        };
      }
    }
  };

  const append = (
    value:
      | WithFieldId<Partial<FormArrayValues>>
      | WithFieldId<Partial<FormArrayValues>>[],
  ) => {
    mapCurrentFieldsValueWithState();
    if (readFormStateRef.current.dirty) {
      isDirtyRef.current = true;
    }
    watchFieldArrayRef.current[name] = [
      ...fields,
      ...(isArray(value) ? value.map(appendId) : [appendId(value)]),
    ];
    setField(watchFieldArrayRef.current[name]);
  };

  const prepend = (
    value:
      | WithFieldId<Partial<FormArrayValues>>
      | WithFieldId<Partial<FormArrayValues>>[],
  ) => {
    mapCurrentFieldsValueWithState();
    resetFields();
    watchFieldArrayRef.current[name] = prependAt(
      fields,
      isArray(value) ? value.map(appendId) : [appendId(value)],
    );
    setField(watchFieldArrayRef.current[name]);

    if (errorsRef.current[name]) {
      errorsRef.current[name] = prependAt(
        errorsRef.current[name],
        fillEmptyArray(value),
      );
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      touchedFieldsRef.current[name] = prependAt(
        touchedFieldsRef.current[name],
        fillEmptyArray(value),
      );
    }
  };

  const remove = (index?: number) => {
    if (!isUndefined(index)) {
      mapCurrentFieldsValueWithState();
    }

    removeFromFields(index);

    watchFieldArrayRef.current[name] = removeArrayAt(fields, index);
    setField(watchFieldArrayRef.current[name]);

    if (errorsRef.current[name]) {
      errorsRef.current[name] = removeArrayAt(errorsRef.current[name], index);
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      touchedFieldsRef.current[name] = removeArrayAt(
        touchedFieldsRef.current[name],
        index,
      );
    }
  };

  const insert = (
    index: number,
    value:
      | WithFieldId<Partial<FormArrayValues>>
      | WithFieldId<Partial<FormArrayValues>>[],
  ) => {
    mapCurrentFieldsValueWithState();
    resetFields(insertAt(getFieldValueByName(fieldsRef.current, name), index));
    watchFieldArrayRef.current[name] = insertAt(
      fields,
      index,
      isArray(value) ? value.map(appendId) : [appendId(value)],
    );
    setField(watchFieldArrayRef.current[name]);

    if (errorsRef.current[name]) {
      errorsRef.current[name] = insertAt(
        errorsRef.current[name],
        index,
        fillEmptyArray(value),
      );
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      touchedFieldsRef.current[name] = insertAt(
        touchedFieldsRef.current[name],
        index,
        fillEmptyArray(value),
      );
    }
  };

  const swap = (indexA: number, indexB: number) => {
    mapCurrentFieldsValueWithState();
    const fieldValues = getFieldValueByName(fieldsRef.current, name);
    swapArrayAt(fieldValues, indexA, indexB);
    resetFields(fieldValues);
    swapArrayAt(fields, indexA, indexB);
    setField([...fields]);
    watchFieldArrayRef.current[name] = fields;

    if (errorsRef.current[name]) {
      swapArrayAt(errorsRef.current[name], indexA, indexB);
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      swapArrayAt(touchedFieldsRef.current[name], indexA, indexB);
    }
  };

  const move = (from: number, to: number) => {
    mapCurrentFieldsValueWithState();
    const fieldValues = getFieldValueByName(fieldsRef.current, name);
    moveArrayAt(fieldValues, from, to);
    resetFields(fieldValues);
    moveArrayAt(fields, from, to);
    setField([...fields]);
    watchFieldArrayRef.current[name] = fields;

    if (errorsRef.current[name]) {
      moveArrayAt(errorsRef.current[name], from, to);
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      moveArrayAt(touchedFieldsRef.current[name], from, to);
    }
  };

  const reset = () => {
    resetFields();
    memoizedDefaultValues.current = get(defaultValuesRef.current, name, []);
    setField(mapIds(memoizedDefaultValues.current));
  };

  useEffect(() => {
    const resetFunctions = resetFieldArrayFunctionRef.current;
    const fieldArrayNames = fieldArrayNamesRef.current;
    fieldArrayNames.add(name);
    resetFunctions[name] = reset;
    watchFieldArrayRef.current[name] = {};

    return () => {
      resetFields();
      delete resetFunctions[name];
      fieldArrayNames.delete(name);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return {
    swap,
    move,
    prepend,
    append,
    remove,
    insert,
    fields,
  };
}
