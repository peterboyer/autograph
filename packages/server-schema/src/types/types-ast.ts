import { TType, TScalar, Typed } from "./types-types";
import { TGraphTypeDefs } from "./types-graph";
import { TResolver } from "./types-graphql";
import { TQuery } from "../graph/ast-resolvers/ast-resolvers-options";

export type TAST = {
  name: string;
  fields: Record<string, TField>;
  hooks: THooks;
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
      transactor: TResolver;
    };
    set: null | {
      stage: "pre" | "post";
      arg: TScalar | null;
      transactor: (value: any, source: any, context: any) => Promise<any>;
    };
  };
  // access: Partial<Record<"get" | "set" | "default", TAccessor<any, any>>>;
  orderTarget: null | string;
  filterTarget: null | string;
  default?: any;
};

/**
 * HOOKS
 */
export type THooks<Source = Record<string, any>, Context = any> = {
  preUpsert:
    | ((
        source: Source | undefined,
        data: Partial<Source>,
        context: Context
      ) => Promise<void> | void)
    | null;
  postUpsert:
    | ((source: Source, context: Context) => Promise<void> | void)
    | null;
  preDelete:
    | ((source: Source, context: Context) => Promise<void> | void)
    | null;
  postDelete:
    | ((source: Source, context: Context) => Promise<void> | void)
    | null;
};

/**
 * FILTER
 */
export type TFilter = {
  arg: TScalar;
  stage: "pre" | "post";
  transactor: (
    value: Typed<TScalar>,
    query: any,
    context: Parameters<TResolver>
  ) => void;
};

/**
 * QUERY
 */
export type TQuerier<Query = Record<string, any>, Context = any> = (
  query: Query,
  context: Context
) => Promise<void> | void;
