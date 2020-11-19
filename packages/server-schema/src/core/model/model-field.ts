import { Types, TScalar } from "../types/types-types";
import { TField } from "./model-types";
import { TField as TFieldAST } from "../types/types-ast";

export function Field(field: TField, fieldName: string): TFieldAST {
  if ("_is" in field) {
    const type = field;

    const resolverGet: TFieldAST["resolver"]["get"] = {
      args: {},
      transactor: () => (source) => source[fieldName],
    };

    const resolverSet: TFieldAST["resolver"]["set"] = {
      stage: "pre",
      arg: type._is === "object" ? Types.ID : (type as TScalar),
      transactor: () => (value) => ({ [fieldName]: value }),
    };

    return {
      type,
      resolver: {
        get: resolverGet,
        set: resolverSet,
      },
      access: {},
      orderTarget: type._is === "scalar" ? fieldName : null,
      filterTarget: type._is === "scalar" ? fieldName : null,
      default: null,
    };
  }

  const type = field.type;

  const resolverGet = ((): TFieldAST["resolver"]["get"] => {
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

  const orderTarget = ((): TFieldAST["orderTarget"] => {
    if (field.orderTarget) return field.orderTarget;

    if (type._is !== "scalar") return null;
    const _resolver = field.resolver;

    if (!_resolver) return fieldName;

    if (typeof _resolver === "string") return _resolver;

    if (typeof _resolver.get === "string") return _resolver.get;

    return null;
  })();

  const filterTarget = ((): TFieldAST["filterTarget"] => {
    if (field.filterTarget) return field.filterTarget;

    const _resolver = field.resolver;

    if (!_resolver) return fieldName;

    if (typeof _resolver === "string") return _resolver;

    if (typeof _resolver.get === "string") return _resolver.get;

    return null;
  })();

  const _default = field.default || null;

  return {
    type,
    resolver: {
      get: resolverGet,
      set: resolverSet,
    },
    access: {},
    orderTarget,
    filterTarget,
    default: _default,
  };
}

export default Field;
