import { GraphQLResolveInfo } from "graphql";
import { TResolver } from "../types/types-graphql";
import { TType, TScalar, Typed, TypedDict } from "../types/types-types";
import { TGraphTypeDefs } from "../types/types-graph";
import {
  THooks as THooksAST,
  TQuerier as TQuerierAST,
} from "../types/types-ast";
import { TQuery } from "../graph/ast-resolvers/ast-resolvers-options";

export type TArgs = {
  Source: any;
  Context: any;
  Query: any;
};

export type TModel<A extends TArgs = TArgs> = {
  name: string;
  fields: Record<any, TField<A>>;
  hooks: Partial<THooks<A>>;
  filters: Record<any, TFilter<A>>;
  query: Partial<Record<"one" | "many" | "default", TQuerier<A>>>;
  typeDefs: Partial<TGraphTypeDefs>;
  limitDefault: number;
  limitMax: number;
};

type ArgsSourceKeys<A extends TArgs = TArgs> = Extract<
  keyof A["Source"],
  string
>;

type MutationData<A extends TArgs = TArgs> = Partial<Omit<A["Source"], "id">>;

/**
 * FIELDS
 */
export type TField<A extends TArgs = TArgs> =
  | FieldAsType
  | FieldAsDefinition<A>;

type FieldAsType = TType;
type FieldAsDefinition<A extends TArgs = TArgs> = {
  type: TType;
} & (
  | {
      alias: ArgsSourceKeys<A>;
    }
  | {
      alias?: never;
      get?: null | ArgsSourceKeys<A> | TFieldGetResolver<A>;
      set?: null | ArgsSourceKeys<A> | TFieldSetResolver<A>;
    }
) & {
    // targets
    orderTarget?: ArgsSourceKeys<A>;
    filterTarget?: ArgsSourceKeys<A>;
    // misc
    default?: any;
  } & {
    // hooks
    onCreate?: (
      context: A["Context"],
      info: GraphQLResolveInfo
    ) => Promise<MutationData<A> | undefined> | MutationData<A> | undefined;
    onCreate_afterCommit?: (
      source: A["Source"],
      context: A["Context"],
      info: GraphQLResolveInfo
    ) => Promise<void> | void;
    onUpdate?: (
      source: A["Source"],
      context: A["Context"],
      info: GraphQLResolveInfo
    ) => Promise<MutationData<A> | undefined> | MutationData<A> | undefined;
    onUpdate_afterCommit?: (
      source: A["Source"],
      context: A["Context"],
      info: GraphQLResolveInfo
    ) => Promise<void> | void;
    onCreateAndUpdate?: (
      source: A["Source"],
      context: A["Context"],
      info: GraphQLResolveInfo
    ) => Promise<MutationData<A> | undefined> | MutationData<A> | undefined;
    onCreateAndUpdate_afterCommit?: (
      source: A["Source"],
      context: A["Context"],
      info: GraphQLResolveInfo
    ) => Promise<void> | void;
    onDelete?: (
      source: A["Source"],
      context: A["Context"],
      info: GraphQLResolveInfo
    ) => Promise<void> | void;
    onDelete_afterCommit?: (
      source: A["Source"],
      context: A["Context"],
      info: GraphQLResolveInfo
    ) => Promise<void> | void;
    onMutation?: (
      context: A["Context"],
      info: GraphQLResolveInfo
    ) => Promise<void> | void;
    onMutation_afterCommit?: (
      context: A["Context"],
      info: GraphQLResolveInfo
    ) => Promise<void> | void;
  };

type TFieldGetResolver<A extends TArgs = TArgs> = (modifiers: {
  use: <R extends TResolver<A["Source"], TypedDict<{}>, A["Context"]>>(
    transactor: R
  ) => {
    transactor: R;
  };
  args: <T extends Record<string, TType>>(
    args: T
  ) => <R extends TResolver<A["Source"], TypedDict<T>, A["Context"]>>(
    transactor: R
  ) => {
    args: T;
    transactor: R;
  };
}) => void;

type TFieldSetResolver<A extends TArgs = TArgs> = (modifiers: {
  pre: <T extends TScalar>(
    arg: T
  ) => <
    R extends (
      value: Typed<T>,
      source: A["Source"] | undefined,
      context: A["Context"]
    ) => Promise<Partial<A["Source"]> | void> | Partial<A["Source"]> | void
  >(
    transactor: R
  ) => void;
  post: <T extends TScalar>(
    arg: T
  ) => <
    R extends (
      value: Typed<T>,
      source: A["Source"],
      context: A["Context"]
    ) => Promise<Partial<A["Source"]> | void> | Partial<A["Source"]> | void
  >(
    transactor: R
  ) => void;
}) => void;

/**
 * ACCESS
 */
export type THooks<A extends TArgs = TArgs> = THooksAST<
  A["Source"],
  A["Context"]
>;

/**
 * FILTER
 */
export type TFilter<A extends TArgs = TArgs> = (modifiers: {
  pre: <T extends TScalar>(
    type: T
  ) => <
    R extends (
      value: NonNullable<Typed<T>>,
      query: TQuery<A["Context"]>,
      context: A["Context"]
    ) => void
  >(
    resolver: R
  ) => void;
  post: <T extends TScalar>(
    type: T
  ) => <
    R extends (
      value: NonNullable<Typed<T>>,
      query: A["Query"],
      context: A["Context"]
    ) => void
  >(
    resolver: R
  ) => void;
}) => void;

/**
 * QUERY
 */
export type TQuerier<A extends TArgs = TArgs> = TQuerierAST<
  A["Query"],
  A["Context"]
>;
