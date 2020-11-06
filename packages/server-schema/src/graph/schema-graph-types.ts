import { GraphQLResolveInfo } from "graphql";

import { TType, Typed } from "./field-types";
export * from "./field-types";

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

export type TField = {
  type: TType;
  resolver: {
    get: null | {
      args: Record<any, TType<unknown, "scalar">>;
      transactor: TNodeGetTransactor;
    };
    set:
      | null
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
  access: Partial<Record<"get" | "set" | "default", TAccessor<any, any>>>;
};

export type TSourceTree = {
  name: string;
  fields: Record<any, TField>;
  access: Record<
    "create" | "read" | "update" | "delete" | "default",
    TAccessor<any, any> | null
  >;
  filters: Record<any, TFilter<TType<unknown, "scalar">, any>>;
  query: Record<"one" | "many" | "default", TQuerier | null>;
  typeDefs: Partial<TSchemaTypeDefs>;
  limitDefault: number;
  limitMaxDefault: number;
  // queryById: (
  //   arg: any,
  //   resolverArgs: Parameters<TResolver>,
  //   getter?: TQuerier,
  //   trx?: TTransaction
  // ) => Promise<any>;
  // queryByArgs: (
  //   args: any,
  //   resolverArgs: Parameters<TResolver>,
  //   getter?: TQuerier,
  //   trx?: TTransaction
  // ) => Promise<any>;
  // queryOnCreate: (
  //   transactors: {
  //     pre: (trx: TTransaction) => Promise<any>;
  //     post: (trx: TTransaction, id: TXID) => Promise<void>;
  //   }[],
  //   resolverArgs: Parameters<TResolver>,
  //   getter?: TQuerier
  // ) => Promise<any>;
  // queryOnUpdate: (
  //   transactors: {
  //     pre: (trx: TTransaction) => Promise<any>;
  //     post: (trx: TTransaction, id: TXID) => Promise<void>;
  //   }[],
  //   resolverArgs: Parameters<TResolver>,
  //   getter?: TQuerier
  // ) => Promise<any>;
  // queryOnDelete: (
  //   ids: TID[],
  //   resolverArgs: Parameters<TResolver>
  // ) => Promise<any>;
  // errors: TErrors;
};
