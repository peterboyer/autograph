import { TResolver } from "../types/types-graphql";
import { Types, TType, Typed, TypedDict } from "../types/types-types";
import { TGraphNodeType } from "../types/types-graph";
import {
  TModelAST,
  TField,
  TAccessor,
  TFilter,
  TQuerier,
} from "../types/types-schema-ast";

type TArgs = {
  Source: unknown;
  Context: unknown;
};

type TModelFieldGetResolverModifiers<A extends TArgs> = {
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

type TModelFieldGetResolver<A extends TArgs> = (
  modifiers: TModelFieldGetResolverModifiers<A>
) => void;

type TModelFieldSetResolverModifiers<A extends TArgs> = {
  pre: <T extends TType<unknown, "scalar">>(
    arg: T
  ) => <R extends (value: Typed<T>, context: A["Context"]) => void>(
    transactor: R
  ) => void;
  post: <T extends TType<unknown, "scalar">>(
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

type TModelFieldSetResolver<A extends TArgs> = (
  modifiers: TModelFieldSetResolverModifiers<A>
) => void;

type TModelAccessor<A extends TArgs> = TAccessor<A["Source"], A["Context"]>;

type TModelField<A extends TArgs> =
  | TType
  | {
      type: TType;
      resolver?:
        | string
        | {
            get?: null | string | TModelFieldGetResolver<A>;
            set?: null | string | TModelFieldSetResolver<A>;
          };
      access?: Partial<Record<"get" | "set" | "default", TModelAccessor<A>>>;
    };

type TModelGeneric<A extends TArgs> = {
  name: string;
  fields: Record<any, TModelField<A>>;
  access?: Partial<
    Record<
      "create" | "read" | "update" | "delete" | "default",
      TModelAccessor<A>
    >
  >;
  filters?: Record<
    any,
    (modifiers: {
      use: <A extends TType<unknown, "scalar">>(
        type: A
      ) => <R extends (config: unknown, value: Typed<A>) => void>(
        resolver: R
      ) => void;
    }) => void
  >;
  query?: {
    one?: TQuerier<A["Source"], A["Context"], unknown>;
    many?: TQuerier<A["Source"], A["Context"], unknown>;
    default?: TQuerier<A["Source"], A["Context"], unknown>;
  };
  typeDefs?: Partial<TGraphNodeType>;
};

/**
 * Parses a source object into a source tree object for compilation.
 * TSource describes your object as returned from a data source.
 * TArgs describes other parts:
 *   - Context, which describes the graph context
 *   - QueryConfig, which ?
 */
export function Model<
  Source extends {},
  Config extends { Context: unknown },
  Args extends TArgs = { Source: Source; Context: Config["Context"] },
  TModel extends TModelGeneric<Args> = TModelGeneric<Args>
>(model: TModel) {
  const defaults = {
    fields: {},
    access: {},
    filters: {},
    query: {}, // unsure
    typeDefs: {},
    limitDefault: 20,
    limitMaxDefault: 50,
  };

  const { name } = model;

  const fields = Object.entries(model.fields).reduce(
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
    {} as TModelAST["fields"]
  );

  const access = {
    create: model.access?.create || null,
    read: model.access?.read || null,
    update: model.access?.update || null,
    delete: model.access?.delete || null,
    default: model.access?.default || null,
  };

  const filters: TModelAST["filters"] = Object.entries(
    model.filters || {}
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
    one: model.query?.one || null,
    many: model.query?.many || null,
    default: model.query?.default || null,
  };

  const typeDefs = model.typeDefs || {};

  const ast = Object.assign(defaults, {
    name,
    fields,
    access,
    filters,
    query,
    typeDefs,
  });

  return ast;
}

export default Model;
