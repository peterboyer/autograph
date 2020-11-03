import { GraphQLResolveInfo } from "graphql";

export type TType<T = unknown, I = "scalar" | "complex"> = {
  __is: I;
  name: string;
  type: T;
  nullable: boolean;
  array: boolean;
};

export const Scalar = <T>(name: string) =>
  ({ name, __is: "scalar" } as TType<T, "scalar">);

export const Complex = (name: string) =>
  ({ name, __is: "complex" } as TType<never, "complex">);

export const types = {
  ID: Scalar<string>("ID"),
  INT: Scalar<number>("Int"),
  FLOAT: Scalar<number>("Float"),
  STRING: Scalar<string>("String"),
  BOOLEAN: Scalar<boolean>("Boolean"),
  MISC: "sn",
} as const;

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

export type TResolver<
  TSource = any,
  TArgs = any,
  TContext = any,
  TReturn = any
> = (
  source: TSource,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TReturn;

export type TErrors = {
  NotFound: (...args: any[]) => void;
  NotAllowed: (...args: any[]) => void;
};

export type TAccessor<TSource, TContext> = (
  source: TSource,
  context: TContext
) => void;

export type TQuerier<
  TSource = any,
  TContext = unknown,
  TQueryConfig = unknown,
  TTransaction = unknown
> = (
  config: TQueryConfig,
  trx?: TTransaction
) => TResolver<TSource, {}, TContext>;

export type TFilter<
  TArg extends TType<unknown, "scalar"> = TType<unknown, "scalar">,
  TQueryConfig = unknown
> = {
  arg: TArg;
  resolver: (config: TQueryConfig, value: Typed<TArg>) => void;
};

export type TSchemaNodeType = "Root" | "Query" | "Mutation";
export type TSchemaTypeDefs = Record<TSchemaNodeType, string>;
export type TSchemaResolvers = Record<TSchemaNodeType, TResolver>;

export type TSchema = {
  typeDefs: TSchemaTypeDefs;
  resolvers: TSchemaResolvers;
};

export type TName = string;

export type TNodeGetTransactor = (transaction?: any) => TResolver;

export type TNodeSetPreTransactor = (
  transaction?: any
) => (value: any, context: any) => void;

export type TNodeSetPostTransactor = (
  transaction?: any
) => (source: any, value: any, context: any) => void;

export type TID = string | number;

export type TNode = {
  type: TType;
  resolver?:
    | string
    | {
        get?:
          | null
          | string
          | {
              args?: Record<any, TType<unknown, "scalar">>;
              transactor: TNodeGetTransactor;
            };
        set?:
          | null
          | string
          | {
              stage: "pre";
              arg: TType<unknown, "scalar">;
              transactor: TNodeSetPreTransactor;
            }
          | {
              stage: "post";
              arg: TType<unknown, "scalar">;
              transactor: TNodeSetPostTransactor;
            };
      };
  access?: Partial<Record<"get" | "set" | "default", TAccessor<any, any>>>;
};

export type TNodes = Record<any, TNode>;

export type TOptions<TXID = TID, TTransaction = unknown> = {
  access?: Partial<
    Record<
      "create" | "read" | "update" | "delete" | "default",
      TAccessor<any, any>
    >
  >;
  filters?: Record<any, TFilter<TType<unknown, "scalar">, any>>;
  query?: {
    one?: TQuerier;
    many?: TQuerier;
    default?: TQuerier;
  };
  typeDefs?: Partial<TSchemaTypeDefs>;
  limitDefault: number;
  limitMaxDefault: number;
  queryById: (
    arg: any,
    resolverArgs: Parameters<TResolver>,
    getter?: TQuerier,
    trx?: TTransaction
  ) => Promise<any>;
  queryByArgs: (
    args: any,
    resolverArgs: Parameters<TResolver>,
    getter?: TQuerier,
    trx?: TTransaction
  ) => Promise<any>;
  queryOnCreate: (
    transactors: {
      pre: (trx: TTransaction) => Promise<any>;
      post: (trx: TTransaction, id: TXID) => Promise<void>;
    }[],
    resolverArgs: Parameters<TResolver>,
    getter?: TQuerier
  ) => Promise<any>;
  queryOnUpdate: (
    transactors: {
      pre: (trx: TTransaction) => Promise<any>;
      post: (trx: TTransaction, id: TXID) => Promise<void>;
    }[],
    resolverArgs: Parameters<TResolver>,
    getter?: TQuerier
  ) => Promise<any>;
  queryOnDelete: (
    ids: TID[],
    resolverArgs: Parameters<TResolver>
  ) => Promise<any>;
  errors: TErrors;
};
