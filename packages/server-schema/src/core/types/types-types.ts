import omit from "lodash.omit";

export type TYPE = "scalar" | "object";

export type TType<T = TYPE, V = unknown> = Readonly<{
  _is: T;
  _type: V;
  name: string;
  isNonNull: boolean;
  isList: boolean;
}>;

// constructor

export const Type = <T extends TYPE, V>(_is: T, name: string) => {
  const self = {
    _is,
    _type: (undefined as unknown) as V,
    name,
    isList: false,
    isNonNull: false,
    get List(): {
      _is: typeof self["_is"];
      _type: typeof self["_type"];
      name: typeof self["name"];
      isList: true;
      isNonNull: typeof self["isNonNull"];
      NonNull: {
        _is: typeof self["_is"];
        _type: typeof self["_type"];
        name: typeof self["name"];
        isList: true;
        isNonNull: true;
      };
    } {
      return {
        ...omit(self, ["List", "NonNull"]),
        isList: true,
        get NonNull(): {
          _is: typeof self["_is"];
          _type: typeof self["_type"];
          name: typeof self["name"];
          isList: true;
          isNonNull: true;
        } {
          return {
            ...omit(self, ["List", "NonNull"]),
            isList: true,
            isNonNull: true,
          };
        },
      };
    },
    get NonNull(): {
      _is: typeof self["_is"];
      _type: typeof self["_type"];
      name: typeof self["name"];
      isList: typeof self["isList"];
      isNonNull: true;
    } {
      return {
        ...omit(self, ["List", "NonNull"]),
        isNonNull: true,
      };
    },
  };

  return Object.freeze(self);
};

// constructor aliases

export type TScalar<V = unknown> = TType<"scalar", V>;
export const Scalar = <V>(name: string) => Type<"scalar", V>("scalar", name);

export type TObject<V = unknown> = TType<"scalar", V>;
const _Object = (name: string) => Type<"object", never>("object", name);
export { _Object as Object };

// core types

export const Types = {
  ID: Scalar<string>("ID"),
  Int: Scalar<number>("Int"),
  Float: Scalar<number>("Float"),
  String: Scalar<string>("String"),
  Boolean: Scalar<boolean>("Boolean"),
  Scalar,
  Object: _Object,
} as const;

// type helpers

export type Typed<T extends TType> = T["_is"] extends "scalar"
  ? TypedIsNonNull<T, TypedIsList<T>>
  : never;

export type TypedDict<T extends Record<any, TType<any>>> = {
  [K in keyof T]: Typed<T[K]>;
};

export type TypedIsNonNull<
  T extends TType,
  V = T["_type"]
> = T["isNonNull"] extends true ? V : V | null;

export type TypedIsList<
  T extends TType,
  V = T["_type"]
> = T["isList"] extends true ? V[] : V;

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
