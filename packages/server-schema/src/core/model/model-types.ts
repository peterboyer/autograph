import { TResolver } from "../types/types-graphql";
import { TType, TScalar, Typed, TypedDict } from "../types/types-types";
import { TGraphTypeDefs } from "../types/types-graph";
import {
  TAccessor as TAccessorAST,
  TQuerier as TQuerierAST,
} from "../types/types-ast";

export type TArgs = {
  Source: unknown;
  Context: unknown;
};

export type TModel<A extends TArgs = TArgs> = {
  name: string;
  fields: Record<any, TField<A>>;
  access?: Partial<
    Record<"create" | "read" | "update" | "delete" | "default", TAccessor<A>>
  >;
  filters?: Record<any, TFilter>;
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
      access?: Partial<Record<"get" | "set" | "default", TAccessor<A>>>;
      order?: string;
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
    arg: T
  ) => <R extends (value: Typed<T>, context: A["Context"]) => void>(
    transactor: R
  ) => void;
  post: <T extends TScalar>(
    arg: T
  ) => <
    R extends (
      source: A["Source"],
      value: Typed<T>,
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
export type TAccessor<A extends TArgs = TArgs> = TAccessorAST<
  A["Source"],
  A["Context"]
>;

/**
 * FILTER
 */
export type TFilter = (modifiers: {
  use: <A extends TScalar>(
    type: A
  ) => <R extends (value: Typed<A>, config: unknown) => void>(
    resolver: R
  ) => void;
}) => void;

/**
 * QUERY
 */
export type TQuerier<A extends TArgs = TArgs> = TQuerierAST<
  A["Source"],
  A["Context"],
  unknown
>;
