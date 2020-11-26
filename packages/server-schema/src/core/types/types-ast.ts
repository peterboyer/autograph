import { TType, TScalar, Typed } from "./types-types";
import { TGraphTypeDefs } from "./types-graph";
import { TResolver } from "./types-graphql";
import { TQuery } from "../graph/ast-resolvers/ast-resolvers-options";

export type TAST = {
  name: string;
  fields: Record<string, TField>;
  access: Record<
    "create" | "read" | "update" | "delete" | "default",
    TAccessor<any, any> | null
  >;
  filters: Record<string, TFilter>;
  query: Record<"one" | "many" | "default", TQuerier | null>;
  typeDefs: Partial<TGraphTypeDefs>;
  limitDefault: number;
  limitMax: number;
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
          arg: TScalar | null;
          transactor: TNodeSetPreTransactor;
        }
      | {
          stage: "post";
          arg: TScalar | null;
          transactor: TNodeSetPostTransactor;
        };
  };
  access: Partial<Record<"get" | "set" | "default", TAccessor<any, any>>>;
  orderTarget: null | string;
  filterTarget: null | string;
  default?: any;
};

export type TNodeGetTransactor = TResolver;

export type TNodeSetPreTransactor = (
  value: any,
  source: any,
  context: any
) => Promise<any>;

export type TNodeSetPostTransactor = (
  value: any,
  source: any,
  context: any
) => Promise<any>;

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
export type TFilter = {
  arg: TScalar;
  resolver: (
    value: Typed<TScalar>,
    query: TQuery,
    context: Parameters<TResolver>
  ) => TQuery | undefined;
};

/**
 * QUERY
 */
export type TQuerier<Query = Record<string, any>, Context = any> = (
  query: Query,
  context: Context
) => Query | Promise<Query> | void;
