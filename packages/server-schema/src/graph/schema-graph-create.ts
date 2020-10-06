import {
  TType,
  TResolver,
  TAccessor,
  TQuerier,
  TFilter,
  Typed,
  TypedDict,
} from "./schema-graph-types";

export type TName = string;

export type TNode = {
  type: TType | string;
  alias?: string;
  resolver?:
    | string
    | {
        get?:
          | null
          | string
          | {
              args?: Record<any, TType>;
              resolver: TResolver<any, TypedDict<Record<any, TType>>, any>;
            };
        set?:
          | null
          | string
          | {
              stage: "pre" | "post";
              arg: TType;
              transactor: (
                transactor: any
              ) => TResolver<any, Typed<TType>, any>;
            };
      };
  access?: Partial<Record<"get" | "set" | "default", TAccessor<any, any>>>;
};

export type TNodes = Record<any, TNode>;

export type TOptions = {
  access?: Partial<
    Record<
      "create" | "read" | "update" | "delete" | "default",
      TAccessor<any, any>
    >
  >;
  filters?: Record<any, TFilter<TType<any>, any>>;
  query?: {
    one?: TQuerier<any, any, any>;
    many?: TQuerier<any, any, any>;
    default?: TQuerier<any, any, any>;
  };
};

export type TReturn = {
  typeDefs: {
    Root: string;
    Query: string;
    Mutation: string;
  };
  resolvers: {
    Root: () => any;
    Query: () => any;
    Mutation: () => any;
  };
};

export const create = (
  name: TName,
  nodes: TNodes,
  options?: TOptions
): TReturn => {
  return {
    typeDefs: {
      Root: ``,
      Query: ``,
      Mutation: ``,
    },
    resolvers: {
      Root: () => null,
      Query: () => null,
      Mutation: () => null,
    },
  };
};

export default create;
