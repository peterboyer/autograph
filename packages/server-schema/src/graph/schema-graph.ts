import {
  TType,
  TResolver,
  TAccessor,
  TErrors,
  TFilter,
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

  type TNodeGetMods = {
    use: <T extends TResolver<TSource, TypedDict<{}>, TContext>>(
      resolver: T
    ) => {
      resolver: T;
    };
    args: <A extends { [key: string]: TType }>(
      args: A
    ) => <R extends TResolver<TSource, TypedDict<A>, TContext>>(
      resolver: R
    ) => {
      args: A;
      resolver: R;
    };
  };

  type TNodeGet = (modifiers: TNodeGetMods) => void;

  type TNodeSetMods = {
    pre: <A extends TType>(
      arg: A
    ) => <
      R extends (
        trx: TTransaction
      ) => (value: Typed<A>, context: TContext) => void
    >(
      transactor: R
    ) => void;
    post: <A extends TType>(
      arg: A
    ) => <
      R extends (
        trx: TTransaction
      ) => (source: TSource, value: Typed<A>, context: TContext) => void
    >(
      transactor: R
    ) => void;
  };

  type TNodeSet = (modifiers: TNodeSetMods) => void;

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

  type TQuery = (
    config: TQueryConfig
  ) => TResolver<TSource, {}, TContext, void>;

  type TOptions = {
    access?: Partial<
      Record<"create" | "read" | "update" | "delete" | "default", TDefAccessor>
    >;
    filters?: Record<
      any,
      (modifiers: {
        use: <A extends TType>(
          type: A
        ) => <R extends (config: TQueryConfig, value: Typed<A>) => void>(
          resolver: R
        ) => void;
      }) => void
    >;
    query?: {
      one?: TQuery;
      many?: TQuery;
      default?: TQuery;
    };
  };

  return <
    XTName extends TName,
    XTDefNodes extends TDefNodes,
    XTDefOptions extends TOptions
  >(
    name: XTName,
    nodes: XTDefNodes,
    options?: XTDefOptions
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
                          : (() => {
                              let obj: {
                                current?: {
                                  args: any;
                                  resolver: any;
                                };
                              } = {};
                              node.resolver.get({
                                use: (resolver) => {
                                  obj.current = { args: undefined, resolver };
                                  return obj.current;
                                },
                                args: (args) => (resolver) => {
                                  obj.current = { args, resolver };
                                  return obj.current;
                                },
                              });
                              return obj.current!;
                            })()),
                      set:
                        node.resolver.set &&
                        (typeof node.resolver.set === "string"
                          ? node.resolver.set
                          : (() => {
                              let obj: {
                                current?: {
                                  stage: "pre" | "post";
                                  arg: any;
                                  transactor: any;
                                };
                              } = {};
                              node.resolver.set({
                                pre: (arg) => (transactor) => {
                                  obj.current = {
                                    stage: "pre",
                                    arg,
                                    transactor,
                                  };
                                  return obj.current;
                                },
                                post: (arg) => (transactor) => {
                                  obj.current = {
                                    stage: "post",
                                    arg,
                                    transactor,
                                  };
                                  return obj.current;
                                },
                              });
                              return obj.current!;
                            })()),
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
    }, {} as { [K in keyof XTDefNodes]: TNode });

    const _options = options && {
      access: options.access && {
        create:
          options.access.create &&
          options.access.create(config?.errors || defaults.errors),
        read:
          options.access.read &&
          options.access.read(config?.errors || defaults.errors),
        update:
          options.access.update &&
          options.access.update(config?.errors || defaults.errors),
        delete:
          options.access.delete &&
          options.access.delete(config?.errors || defaults.errors),
        default:
          options.access.default &&
          options.access.default(config?.errors || defaults.errors),
      },
      filters:
        options.filters &&
        Object.entries(options.filters).reduce((acc, [name, filter]) => {
          let obj: {
            current?: {
              arg: any;
              resolver: any;
            };
          } = {};

          filter({
            use: (arg) => (resolver) => {
              obj.current = {
                arg,
                resolver,
              };
              return obj.current;
            },
          });

          Object.assign(acc, { [name]: obj.current });
          return acc;
        }, {} as { [K in keyof XTDefOptions["filters"]]: TFilter<TType, unknown> }),
    };

    return create(name, _nodes, _options);
  };
};

export default schema;
