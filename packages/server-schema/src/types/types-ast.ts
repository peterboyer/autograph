import { TType, TScalar, Typed } from "./types-types";
import { TGraphTypeDefs } from "./types-graph";
import { TResolver } from "./types-graphql";

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

type MaybePromise<T> = Promise<T> | T;

/**
 * FIELDS
 */
export type TField = {
  type: TType;
  get?: {
    args: Record<any, TScalar>;
    transactor: TResolver;
  };
  set?: {
    arg: TScalar;
    transactor: (value: any, source: any, context: any) => Promise<any>;
    stage: "pre" | "post";
  };

  onCreate?: (
    context: any,
    info: any
  ) => MaybePromise<Record<string, any> | undefined>;
  onCreate_afterCommit?: (
    source: any,
    context: any,
    info: any
  ) => MaybePromise<void>;
  onUpdate?: (
    source: any,
    context: any,
    info: any
  ) => MaybePromise<Record<string, any> | undefined>;
  onUpdate_afterCommit?: (
    source: any,
    context: any,
    info: any
  ) => MaybePromise<void>;
  onCreateAndUpdate?: (
    source: any,
    context: any,
    info: any
  ) => MaybePromise<Record<string, any> | undefined>;
  onCreateAndUpdate_afterCommit?: (
    source: any,
    context: any,
    info: any
  ) => MaybePromise<void>;
  onDelete?: (source: any, context: any, info: any) => MaybePromise<void>;
  onDelete_afterCommit?: (
    source: any,
    context: any,
    info: any
  ) => MaybePromise<void>;
  onMutation?: (context: any, info: any) => MaybePromise<void>;
  onMutation_afterCommit?: (context: any, info: any) => MaybePromise<void>;

  orderTarget?: string;
  filterTarget?: string;
  default?: any;
};

export type THooksMeta = {
  operation: "create" | "update" | "delete";
};

/**
 * HOOKS
 */
export type THooks<Source = Record<string, any>, Context = any> = {
  preUpsert:
    | ((
        source: Source | undefined,
        data: Partial<Source>,
        context: Context,
        meta: THooksMeta
      ) => Promise<void> | void)
    | null;
  postUpsert:
    | ((
        source: Source,
        context: Context,
        meta: THooksMeta
      ) => Promise<void> | void)
    | null;
  preDelete:
    | ((
        source: Source,
        context: Context,
        meta: THooksMeta
      ) => Promise<void> | void)
    | null;
  postDelete:
    | ((
        source: Source,
        context: Context,
        meta: THooksMeta
      ) => Promise<void> | void)
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
