import { Types, TScalar } from "../types/types-types";
import { TField } from "./model-types";
import { TField as TFieldAST } from "../types/types-ast";

export function Field(field: TField, defaultSourceProperty: string): TFieldAST {
  if ("_is" in field) {
    const type = field;

    const resolverGet: TFieldAST["resolver"]["get"] = {
      args: {},
      transactor: () => (source) => source[defaultSourceProperty],
    };

    const resolverSet: TFieldAST["resolver"]["set"] = {
      stage: "pre",
      arg: type as TScalar,
      transactor: () => (value) => ({ [defaultSourceProperty]: value }),
    };

    return {
      type,
      resolver: {
        get: resolverGet,
        set: resolverSet,
      },
      access: {},
    };
  }

  const type = field.type;

  const resolverGet = ((): TFieldAST["resolver"]["get"] => {
    const _resolver = field.resolver;

    if (!_resolver) {
      return {
        args: {},
        transactor: () => (source) => source[defaultSourceProperty],
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
        transactor: () => (source) => source[defaultSourceProperty],
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
      const resolver: TFieldAST["resolver"]["get"] = {};

      _resolverGet({
        use: (transactor) => Object.assign(resolver, { args: {}, transactor }),
        args: (args) => (transactor) =>
          Object.assign(resolver, { args, transactor }),
      });

      return resolver;
    }

    return null;
  })();

  const resolverSet = ((): TFieldAST["resolver"]["set"] => {
    const _resolver = field.resolver;
    const _resolverType = type._is === "object" ? Types.ID : (type as TScalar);

    if (!_resolver) {
      return {
        stage: "pre",
        arg: _resolverType,
        transactor: () => (value) => ({ [defaultSourceProperty]: value }),
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
        transactor: () => (value) => ({ [defaultSourceProperty]: value }),
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

  return {
    type,
    resolver: {
      get: resolverGet,
      set: resolverSet,
    },
    access: {},
  };
}

export default Field;
