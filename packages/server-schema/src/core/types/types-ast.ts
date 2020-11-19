import { TType, TScalar, Typed } from "./types-types";
import { TGraphTypeDefs } from "./types-graph";
import { TResolver } from "./types-graphql";

export type TAST = {
  name: string;
  fields: Record<any, TField>;
  access: Record<
    "create" | "read" | "update" | "delete" | "default",
    TAccessor<any, any> | null
  >;
  filters: Record<any, TFilter<TScalar, any>>;
  query: Record<"one" | "many" | "default", TQuerier | null>;
  typeDefs: Partial<TGraphTypeDefs>;
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

/**
 * FIELDS
 */
export type TField = {
  type: TType;
  resolver: {
    get: null | {
      args: Record<any, TScalar>;
      transactor: TNodeGetTransactor;
    };
    set:
      | null
      | {
          stage: "pre";
          arg: TScalar;
          transactor: TNodeSetPreTransactor;
        }
      | {
          stage: "post";
          arg: TScalar;
          transactor: TNodeSetPostTransactor;
        };
  };
  access: Partial<Record<"get" | "set" | "default", TAccessor<any, any>>>;
};

export type TNodeGetTransactor = (transaction?: any) => TResolver;

export type TNodeSetPreTransactor = (
  transaction?: any
) => (value: any, context: any) => void;

export type TNodeSetPostTransactor = (
  transaction?: any
) => (source: any, value: any, context: any) => void;

/**
 * ACCESS
 */
export type TAccessor<TSource, TContext> = (
  source: TSource,
  context: TContext
) => void;

/**
 * FILTER
 */
export type TFilter<TArg extends TScalar = TScalar, TQueryConfig = unknown> = {
  arg: TArg;
  resolver: (config: TQueryConfig, value: Typed<TArg>) => void;
};

/**
 * QUERY
 */
export type TQuerier<
  TSource = unknown,
  TContext = unknown,
  TQueryConfig = unknown
> = (config: TQueryConfig) => TResolver<TSource, unknown, TContext>;
