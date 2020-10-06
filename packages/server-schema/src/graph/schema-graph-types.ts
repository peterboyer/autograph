export type TType<T = unknown> = {
  __is: "type";
  name: string;
  type: T;
  nullable: boolean;
};

export const Type = <T>(name: string) => ({ name, __is: "type" } as TType<T>);

export const types = {
  ID: Type<string>("ID"),
  INT: Type<number>("Int"),
  FLOAT: Type<number>("Float"),
  STRING: Type<string>("String"),
  BOOLEAN: Type<boolean>("Boolean"),
} as const;

export type TNoNull<T extends TType> = {
  __is: "type";
  name: T["name"];
  type: T["type"];
  nullable: false;
};

export const NoNull = <T extends TType>(type: T) =>
  (({ ...type, nullable: false } as any) as TNoNull<T>);

export type TAsArray<T extends TType> = {
  __is: "type";
  name: T["name"];
  type: T["type"][];
  nullable: T["nullable"];
};

export const AsArray = <T extends TType>(type: T) =>
  (({
    ...type,
    array: true,
  } as any) as TAsArray<T>);

export type Typed<T extends TType> = T["nullable"] extends false
  ? T["type"]
  : T["type"] | null;

export type TypedDict<T extends Record<any, TType<any>>> = {
  [K in keyof T]: Typed<T[K]>;
};

export type TResolver<TSource, TArgs, TContext, TReturn = any> = (
  source: TSource,
  args: TArgs,
  context: TContext
) => TReturn;

export type TErrors = {
  NotFound: () => void;
  NotAllowed: () => void;
};

export type TAccessor<TSource, TContext> = (
  source: TSource,
  context: TContext
) => void;

export type TQuerier<TSource, TContext, TQueryConfig> = (
  config: TQueryConfig
) => TResolver<TSource, {}, TContext, void>;

export type TFilter<TArg extends TType, TQueryConfig> = {
  arg: TArg;
  resolver: (config: TQueryConfig, value: Typed<TArg>) => void;
};
