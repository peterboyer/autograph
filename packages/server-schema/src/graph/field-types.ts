export type TType<T = unknown, I = "scalar" | "complex"> = {
  __is: I;
  name: string;
  type: T;
  nullable: boolean;
  array: boolean;
};

const TypeDefaults = {
  nullable: true,
  array: false,
} as const;

export const Scalar = <T>(name: string) =>
  ({ __is: "scalar", name, ...TypeDefaults } as TType<T, "scalar">);

export const Complex = (name: string) =>
  ({ __is: "complex", name, ...TypeDefaults } as TType<never, "complex">);

export type TNoNull<T extends TType> = {
  __is: T["__is"];
  name: T["name"];
  type: T["type"];
  nullable: false;
  array: T["array"];
};

export const NoNull = <T extends TType>(type: T) =>
  (({ ...type, nullable: false } as any) as TNoNull<T>);

export type TAsArray<T extends TType> = {
  __is: T["__is"];
  name: T["name"];
  type: T["type"][];
  nullable: T["nullable"];
  array: true;
};

export const AsArray = <T extends TType>(type: T) =>
  (({
    ...type,
    array: true,
  } as any) as TAsArray<T>);

export type Typed<T extends TType> = T["__is"] extends "scalar"
  ? T["nullable"] extends false
    ? T["type"]
    : T["type"] | null
  : never;

export type TypedDict<T extends Record<any, TType<any>>> = {
  [K in keyof T]: Typed<T[K]>;
};

export const Types = {
  ID: Scalar<string>("ID"),
  Int: Scalar<number>("Int"),
  Float: Scalar<number>("Float"),
  String: Scalar<string>("String"),
  Boolean: Scalar<boolean>("Boolean"),
  NoNull,
  AsArray,
} as const;
