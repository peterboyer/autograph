import { Type } from "./type";
import * as Types from "./types";

/**
 * Returns the ValueType of a Type.
 */
export type ValueTyped<TYPE extends Type> = ValueTypedNonNull<
  TYPE,
  ValueTypedList<TYPE>
>;

/**
 * Returns a Record of ValueTypes from a Record of Types.
 */
export type ValueTypedRecord<RECORD extends Record<string, Type>> = {
  [K in keyof RECORD]: ValueTyped<RECORD[K]>;
};

/**
 * if Type is NonNull return only the value type, otherwise return "null" union
 */
export type ValueTypedNonNull<
  TYPE extends Type,
  VALUETYPE = TYPE["__valuetype"]
> = TYPE["__nonnull"] extends true ? VALUETYPE : VALUETYPE | null;

/**
 * if Type is List return value type as array [], otherwise return as is
 */
export type ValueTypedList<TYPE extends Type, VALUETYPE = TYPE["__valuetype"]> =
  TYPE["__list"] extends true ? VALUETYPE[] : VALUETYPE;

/**
 * Converts the given type to a Scalar of ID if given type of Object.
 * @param type Scalar or Object to cast as Scalar.
 * @returns Scalar of given type.
 */
export const toScalar = <TYPE extends Type>(type: TYPE) => {
  type SUBTYPE = TYPE["__subtype"];
  type VALUETYPE = TYPE["__list"] extends true
    ? TYPE["__nonnull"] extends true
      ? typeof Types.ID.List.NonNull
      : typeof Types.ID.List
    : TYPE["__nonnull"] extends true
    ? typeof Types.ID.NonNull
    : typeof Types.ID;
  type LIST = TYPE["__list"];
  type NONNULL = TYPE["__nonnull"];

  return new Type<
    SUBTYPE,
    VALUETYPE,
    { LIST: LIST; NONNULL: NONNULL; DEFAULT: VALUETYPE }
  >(type.__name, type.__subtype, {
    LIST: type.__list,
    NONNULL: type.__nonnull,
    DEFAULT: type.__default,
  });
};
