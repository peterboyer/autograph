import { Type, Scalar } from "./type";
import { Types } from "./types";

/**
 * get type of value from Type
 */
export type Typed<T extends Type> = TypedIsNonNull<T, TypedIsList<T>>;

/**
 * get all types of values from a Record of Types
 */
export type TypedRecord<T extends Record<any, Type<any>>> = {
  [K in keyof T]: Typed<T[K]>;
};

/**
 * if Type is NonNull return only the value type, otherwise return "null" union
 */
export type TypedIsNonNull<
  T extends Type,
  V = T["_type"]
> = T["isNonNull"] extends true ? V : V | null;

/**
 * if Type is List return value type as array [], otherwise return as is
 */
export type TypedIsList<
  T extends Type,
  V = T["_type"]
> = T["isList"] extends true ? V[] : V;

/**
 * if Type is not a Scalar return as ID type, with correct List/NonNull options
 */
export type AsScalar<T extends Type> = T["_is"] extends "scalar"
  ? {
      _is: "scalar";
      _type: T["_type"];
      name: T["name"];
      isList: T["isList"];
      isNonNull: T["isNonNull"];
    }
  : T["isList"] extends true
  ? T["isNonNull"] extends true
    ? typeof Types.ID.List.NonNull
    : typeof Types.ID.List
  : T["isNonNull"] extends true
  ? typeof Types.ID.NonNull
  : typeof Types.ID;

/**
 * same as AsScalar, but with real values
 */
export const asScalar = <T extends Type>(type: T) =>
  type._is === "scalar"
    ? (type as Scalar)
    : type.isList
    ? type.isNonNull
      ? Types.ID.List.NonNull
      : Types.ID.List
    : type.isNonNull
    ? Types.ID.NonNull
    : Types.ID;

/**
 * converts any given type to it's List variant
 */
export const asList = <T extends Type>(type: T) =>
  ({
    _is: type["_is"],
    _type: type["_type"],
    name: type["name"],
    isList: true,
    isNonNull: type["isNonNull"],
  } as {
    _is: T["_is"];
    _type: T["_type"];
    name: T["name"];
    isList: true;
    isNonNull: T["isNonNull"];
  });

// tests

const is_string_only = Types.ID.NonNull;
const is_string_or_null = Types.ID;
const is_string_list_only = Types.ID.List.NonNull;
const is_string_list_or_null = Types.ID.List;
const is_object = Types.Object("User");

type IS_STRING_ONLY = Typed<typeof is_string_only>;
type IS_STRING_OR_NULL = Typed<typeof is_string_or_null>;
type IS_STRING_LIST_ONLY = Typed<typeof is_string_list_only>;
type IS_STRING_LIST_OR_NULL = Typed<typeof is_string_list_or_null>;
type IS_NEVER = Typed<typeof is_object>;
