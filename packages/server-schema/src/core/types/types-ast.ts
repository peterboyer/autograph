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
  filters: Record<string, TFilter<TScalar>>;
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
  orderTarget: null | string;
  filterTarget: null | string;
  default?: any;
};

export type TNodeGetTransactor = TResolver;

export type TNodeSetPreTransactor = (value: any, context: any) => void;

export type TNodeSetPostTransactor = (
  source: any,
  value: any,
  context: any
) => void;

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
export type TFilter<TArg extends TScalar = TScalar> = {
  arg: TArg;
  resolver: (query: TQuery, value: Typed<TArg>) => TQuery | undefined;
};

/**
 * QUERY
 */
export type TQuerier<
  TSource = unknown,
  TContext = unknown,
  TQueryConfig = unknown
> = (config: TQueryConfig) => TResolver<TSource, unknown, TContext>;
