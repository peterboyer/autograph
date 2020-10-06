import {
  TType,
  TResolver,
  TAccessor,
  TErrors,
  Typed,
  TypedDict,
} from "./schema-graph-types";
export * from "./schema-graph-types";
import create, { TName, TNode } from "./schema-graph-create";

export const defaults: {
  errors: TErrors;
} = {
  errors: {
    NotFound: () => {
      throw new Error("Not Found");
    },
    NotAllowed: () => {
      throw new Error("Not Allowed");
    },
  },
};

export const schema = <
  TSource extends {},
  TConfig extends {
    Context?: unknown;
    Transaction?: unknown;
    QueryConfig?: unknown;
  } = {}
>(config?: {
  errors?: TErrors;
}) => {
  type TContext = TConfig["Context"];
  type TTransaction = TConfig["Transaction"];
  type TQueryConfig = TConfig["QueryConfig"];

  const getModifiers = {
    use: <T extends TResolver<TSource, TypedDict<{}>, TContext>>(resolver: T) =>
      ({
        resolver,
      } as const),
    args: <A extends { [key: string]: TType }>(args: A) => <
      R extends TResolver<TSource, TypedDict<A>, TContext>
    >(
      resolver: R
    ) =>
      ({
        args,
        resolver,
      } as const),
  };

  const setModifiers = {
    pre: <A extends TType>(arg: A) => <
      T extends (
        trx: TTransaction
      ) => (value: Typed<A>, context: TContext) => void
    >(
      transactor: T
    ) =>
      ({
        stage: "pre",
        arg,
        transactor,
      } as const),
    post: <A extends TType>(arg: A) => <
      T extends (
        trx: TTransaction
      ) => (source: TSource, value: Typed<A>, context: TContext) => void
    >(
      transactor: T
    ) =>
      ({
        stage: "post",
        arg,
        transactor,
      } as const),
  };

  type TNodeGet = (
    modifiers: typeof getModifiers
  ) => {
    args: { [key: string]: TType };
    resolver: TResolver<TSource, TypedDict<{ [key: string]: TType }>, TContext>;
  };

  type TNodeSet = (
    modifiers: typeof setModifiers
  ) =>
    | {
        stage: "pre";
        arg: TType;
        transactor: (
          trx: TTransaction
        ) => (value: Typed<TType>, context: TContext) => void;
      }
    | {
        stage: "post";
        arg: TType;
        transactor: (
          trx: TTransaction
        ) => (source: TSource, value: Typed<TType>, context: TContext) => void;
      };

  type TDefAccessor = (errors: TErrors) => TAccessor<TSource, TContext>;

  type TDefNode =
    | TType
    | {
        type: TType | string;
        alias?: string;
        resolver?:
          | string
          | {
              get?: null | string | TNodeGet;
              set?: null | string | TNodeSet;
            };
        access?: Partial<Record<"get" | "set" | "default", TDefAccessor>>;
      };

  type TDefNodes = Record<any, TDefNode>;

  const filterModifier = <V extends TType>(type: V) => <
    T extends (config: TQueryConfig, value: Typed<V>) => void
  >(
    resolver: T
  ) => ({
    type,
    resolver,
  });

  type TQuery = (
    config: TQueryConfig
  ) => TResolver<TSource, {}, TContext, void>;

  type TOptions = {
    access?: Partial<
      Record<"create" | "read" | "update" | "delete" | "default", TDefAccessor>
    >;
    filters?: (
      use: typeof filterModifier
    ) => Record<any, ReturnType<ReturnType<typeof filterModifier>>>;
    query?: {
      one?: TQuery;
      many?: TQuery;
      default?: TQuery;
    };
  };

  return <
    XTName extends TName,
    XTNodes extends TDefNodes,
    XTOptions extends TOptions
  >(
    name: XTName,
    nodes: XTNodes,
    options?: XTOptions
  ) => {
    const _nodes = Object.entries(nodes).reduce((acc, [name, node]) => {
      const _node: TNode =
        "__is" in node
          ? {
              type: node,
            }
          : {
              type: node.type,
              alias: node.alias,
              resolver:
                node.resolver &&
                (typeof node.resolver === "string"
                  ? node.resolver
                  : {
                      get:
                        node.resolver.get &&
                        (typeof node.resolver.get === "string"
                          ? node.resolver.get
                          : node.resolver.get(getModifiers)),
                      set:
                        node.resolver.set &&
                        (typeof node.resolver.set === "string"
                          ? node.resolver.set
                          : node.resolver.set(setModifiers)),
                    }),
              access: node.access && {
                get:
                  node.access.get &&
                  node.access.get(config?.errors || defaults.errors),
                set:
                  node.access.set &&
                  node.access.set(config?.errors || defaults.errors),
                default:
                  node.access.default &&
                  node.access.default(config?.errors || defaults.errors),
              },
            };
      Object.assign(acc, { [name]: _node });
      return acc;
    }, {} as { [K in keyof XTNodes]: TNode });

    const _options = options;

    return create(name, _nodes, _options);
  };
};

export default schema;
