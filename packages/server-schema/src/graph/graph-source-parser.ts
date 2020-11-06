import {
  Types,
  TType,
  TResolver,
  TAccessor,
  TFilter,
  Typed,
  TypedDict,
  TField,
  TQuerier,
  TSchemaTypeDefs,
  TSourceTree,
} from "./schema-graph-types";
import Compiler from "./graph-tree-compiler";

/**
 * Parses a source object into a source tree object for compilation.
 * TSource describes your object as returned from a data source.
 * TConfig describes other parts:
 *   - Context, which describes the graph context
 *   - QueryConfig, which ?
 */
const Parser = <
  TConfig extends {
    Context?: unknown;
    QueryConfig?: unknown;
  } = {}
>() => {
  type TContext = TConfig["Context"];
  type TQueryConfig = TConfig["QueryConfig"];

  type TSourceFieldGetResolverModifiers<TSource> = {
    use: <R extends TResolver<TSource, TypedDict<{}>, TContext>>(
      transactor: R
    ) => {
      transactor: R;
    };
    args: <A extends { [key: string]: TType }>(
      args: A
    ) => <R extends TResolver<TSource, TypedDict<A>, TContext>>(
      transactor: R
    ) => {
      args: A;
      transactor: R;
    };
  };

  type TSourceFieldGetResolver<TSource> = (
    modifiers: TSourceFieldGetResolverModifiers<TSource>
  ) => void;

  type TSourceFieldSetResolverModifiers<TSource> = {
    pre: <A extends TType<unknown, "scalar">>(
      arg: A
    ) => <R extends (value: Typed<A>, context: TContext) => void>(
      transactor: R
    ) => void;
    post: <A extends TType<unknown, "scalar">>(
      arg: A
    ) => <
      R extends (source: TSource, value: Typed<A>, context: TContext) => void
    >(
      transactor: R
    ) => void;
  };

  type TSourceFieldSetResolver<TSource> = (
    modifiers: TSourceFieldSetResolverModifiers<TSource>
  ) => void;

  type TSourceAccessor<TSource> = TAccessor<TSource, TContext>;

  type TSourceField<TSource> =
    | TType
    | {
        type: TType;
        resolver?:
          | string
          | {
              get?: null | string | TSourceFieldGetResolver<TSource>;
              set?: null | string | TSourceFieldSetResolver<TSource>;
            };
        access?: Partial<
          Record<"get" | "set" | "default", TSourceAccessor<TSource>>
        >;
      };

  type TSchemaGeneric<TSource> = {
    name: string;
    fields: Record<any, TSourceField<TSource>>;
    access?: Partial<
      Record<
        "create" | "read" | "update" | "delete" | "default",
        TSourceAccessor<TSource>
      >
    >;
    filters?: Record<
      any,
      (modifiers: {
        use: <A extends TType<unknown, "scalar">>(
          type: A
        ) => <R extends (config: TQueryConfig, value: Typed<A>) => void>(
          resolver: R
        ) => void;
      }) => void
    >;
    query?: {
      one?: TQuerier<TSource, TContext, TQueryConfig>;
      many?: TQuerier<TSource, TContext, TQueryConfig>;
      default?: TQuerier<TSource, TContext, TQueryConfig>;
    };
    typeDefs?: Partial<TSchemaTypeDefs>;
  };

  function parser<
    TSource,
    TSchema extends TSchemaGeneric<TSource> = TSchemaGeneric<TSource>
  >(
    // source: TSource,
    schema: TSchema
  ) {
    const defaults = {
      fields: {},
      access: {},
      filters: {},
      query: {}, // unsure
      typeDefs: {},
      limitDefault: 20,
      limitMaxDefault: 50,
    };

    const fields = Object.entries(schema.fields).reduce(
      (acc, [fieldName, field]) => {
        if ("__is" in field) {
          const type: TField["type"] = field;

          const resolverGet: TField["resolver"]["get"] = {
            args: {},
            transactor: () => (source) => source[fieldName],
          };

          const resolverSet: TField["resolver"]["set"] = {
            stage: "pre",
            arg: type as TType<unknown, "scalar">,
            transactor: () => (value) => ({ [fieldName]: value }),
          };

          return Object.assign(acc, {
            [fieldName]: {
              type,
              resolver: {
                get: resolverGet,
                set: resolverSet,
              },
              access: {},
            },
          });
        }

        const type: TField["type"] = field.type;

        const resolverGet = ((): TField["resolver"]["get"] => {
          const _resolver = field.resolver;

          if (!_resolver) {
            return {
              args: {},
              transactor: () => (source) => source[fieldName],
            };
          }

          if (typeof _resolver === "string") {
            return {
              args: {},
              transactor: () => (source) => source[_resolver],
            };
          }

          const _resolverGet = _resolver.get;

          if (_resolverGet === undefined) {
            return {
              args: {},
              transactor: () => (source) => source[fieldName],
            };
          }

          if (typeof _resolverGet === "string") {
            return {
              args: {},
              transactor: () => (source) => source[_resolverGet],
            };
          }

          if (typeof _resolverGet === "function") {
            // @ts-ignore
            const resolver: TField["resolver"]["get"] = {};

            _resolverGet({
              use: (transactor) =>
                Object.assign(resolver, { args: {}, transactor }),
              args: (args) => (transactor) =>
                Object.assign(resolver, { args, transactor }),
            });

            return resolver;
          }

          return null;
        })();

        const resolverSet = ((): TField["resolver"]["set"] => {
          const _resolver = field.resolver;
          const _resolverType =
            type.__is === "complex"
              ? Types.ID
              : (type as TType<unknown, "scalar">);

          if (!_resolver) {
            return {
              stage: "pre",
              arg: _resolverType,
              transactor: () => (value) => ({ [fieldName]: value }),
            };
          }

          if (typeof _resolver === "string") {
            return {
              stage: "pre",
              arg: _resolverType,
              transactor: () => (value) => ({ [_resolver]: value }),
            };
          }

          const _resolverSet = _resolver.set;

          if (_resolverSet === undefined) {
            return {
              stage: "pre",
              arg: _resolverType,
              transactor: () => (value) => ({ [fieldName]: value }),
            };
          }

          if (typeof _resolverSet === "string") {
            return {
              stage: "pre",
              arg: _resolverType,
              transactor: () => (value) => ({ [_resolverSet]: value }),
            };
          }

          if (typeof _resolverSet === "function") {
            // @ts-ignore
            const resolver: TField["resolver"]["set"] = {};

            _resolverSet({
              pre: (arg) => (transactor) =>
                Object.assign(resolver, { stage: "pre", arg, transactor }),
              post: (arg) => (transactor) =>
                Object.assign(resolver, { stage: "post", arg, transactor }),
            });

            return resolver;
          }

          return null;
        })();

        return Object.assign(acc, {
          [fieldName]: {
            type,
            resolver: {
              get: resolverGet,
              set: resolverSet,
            },
            access: {
              get: field.access?.get,
              set: field.access?.set,
              default: field.access?.default,
            },
          },
        });
      },
      {} as TSourceTree["fields"]
    );

    const access = {
      create: schema.access?.create || null,
      read: schema.access?.read || null,
      update: schema.access?.update || null,
      delete: schema.access?.delete || null,
      default: schema.access?.default || null,
    };

    const filters: TSourceTree["filters"] = Object.entries(
      schema.filters || {}
    ).reduce((acc, [name, filter]) => {
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
      return Object.assign(acc, { [name]: obj.current });
    }, {} as Record<any, TFilter>);

    const query = {
      one: schema.query?.one || null,
      many: schema.query?.many || null,
      default: schema.query?.default || null,
    };

    const typeDefs = schema.typeDefs || {};

    const tree = Object.assign(defaults, schema, {
      fields,
      access,
      filters,
      query,
      typeDefs,
    });

    return {
      tree,
      compile: (...compilerArgs: Parameters<typeof Compiler>) => {
        const compiler = Compiler(...compilerArgs);
        return compiler(tree);
      },
    };
  }

  return parser;
};

export default Parser;
