import { TResolver } from "./types-graphql";
import { TGraphTypeDefs } from "./types-graph";
import { TType, Typed } from "./types-types";

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

export type TSchemaAST = {
  name: string;
  fields: Record<any, TField>;
  access: Record<
    "create" | "read" | "update" | "delete" | "default",
    TAccessor<any, any> | null
  >;
  filters: Record<any, TFilter<TType<unknown, "scalar">, any>>;
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
