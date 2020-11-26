import { TResolver } from "../types/types-graphql";
import { TType, TScalar, Typed, TypedDict } from "../types/types-types";
import { TGraphTypeDefs } from "../types/types-graph";
import {
  THooks as THooksAST,
  TQuerier as TQuerierAST,
} from "../types/types-ast";

export type TArgs = {
  Source: any;
  Context: any;
  Query: any;
};

export type TModel<A extends TArgs = TArgs> = {
  name: string;
  fields: Record<any, TField<A>>;
  hooks?: THooks<A>;
  filters?: Record<any, TFilter<A>>;
  query?: Partial<Record<"one" | "many" | "default", TQuerier<A>>>;
  typeDefs?: Partial<TGraphTypeDefs>;
  limitDefault?: number;
  limitMax?: number;
};

/**
 * FIELDS
 */
export type TField<A extends TArgs = TArgs> =
  | TType
  | {
      type: TType;
      resolver?:
        | string
        | {
            get?: null | string | TFieldGetResolver<A>;
            set?: null | string | TFieldSetResolver<A>;
          };
      // access?: Partial<Record<"get" | "set" | "default", TAccessor<A>>>;
      orderTarget?: string;
      filterTarget?: string;
      default?: any;
    };

type TFieldGetResolverModifiers<A extends TArgs = TArgs> = {
  use: <R extends TResolver<A["Source"], TypedDict<{}>, A["Context"]>>(
    transactor: R
  ) => {
    transactor: R;
  };
  args: <A extends { [key: string]: TType }>(
    args: A
  ) => <R extends TResolver<A["Source"], TypedDict<A>, A["Context"]>>(
    transactor: R
  ) => {
    args: A;
    transactor: R;
  };
};

type TFieldGetResolver<A extends TArgs = TArgs> = (
  modifiers: TFieldGetResolverModifiers<A>
) => void;

type TFieldSetResolverModifiers<A extends TArgs = TArgs> = {
  pre: <T extends TScalar>(
    arg: T | null
  ) => <
    R extends (
      value: Typed<T>,
      source: A["Source"] | undefined,
      context: A["Context"]
    ) => void
  >(
    transactor: R
  ) => void;
  post: <T extends TScalar>(
    arg: T | null
  ) => <
    R extends (
      value: Typed<T>,
      source: A["Source"],
      context: A["Context"]
    ) => void
  >(
    transactor: R
  ) => void;
};

type TFieldSetResolver<A extends TArgs = TArgs> = (
  modifiers: TFieldSetResolverModifiers<A>
) => void;

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
  use: <T extends TScalar>(
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
