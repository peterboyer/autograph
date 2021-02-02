import { Types, TScalar } from "../types/types-types";
import { TField } from "./model-types";
import { TField as TFieldAST } from "../types/types-ast";

export function Field(field: TField, fieldName: string): TFieldAST {
  if ("_is" in field) {
    const type = field;

    const resolverGet: TFieldAST["get"] = {
      args: {},
      transactor: (source) => source[fieldName],
    };

    const resolverSet: TFieldAST["set"] = {
      stage: "pre",
      arg: type._is === "object" ? Types.ID : (type as TScalar),
      transactor: async (value) => ({ [fieldName]: value }),
    };

    return {
      type,
      get: resolverGet,
      set: resolverSet,
      orderTarget: type._is === "scalar" ? fieldName : undefined,
      filterTarget: type._is === "scalar" ? fieldName : undefined,
    };
  }

  const type = field.type;

  const resolverGet = ((): TFieldAST["get"] => {
    const _resolver = "get" in field ? field.get : field.alias;

    if (_resolver === undefined) {
      return {
        args: {},
        transactor: (source) => source[fieldName],
      };
    }

    if (typeof _resolver === "string") {
      return {
        args: {},
        transactor: (source) => source[_resolver],
      };
    }

    if (typeof _resolver === "function") {
      // @ts-ignore
      const resolver: TFieldAST["resolver"]["get"] = {};

      _resolver({
        use: (transactor) => Object.assign(resolver, { args: {}, transactor }),
        args: (args) => (transactor) =>
          Object.assign(resolver, { args, transactor }),
      });

      return resolver;
    }
  })();

  const resolverSet = ((): TFieldAST["set"] => {
    const _resolver = "set" in field ? field.set : field.alias;

    const _resolverType =
      type._is === "object"
        ? type.isNonNull
          ? Types.ID.NonNull
          : Types.ID
        : (type as TScalar);

    if (_resolver === undefined) {
      return {
        stage: "pre",
        arg: _resolverType,
        transactor: async (value) => ({ [fieldName]: value }),
      };
    }

    if (typeof _resolver === "string") {
      return {
        stage: "pre",
        arg: _resolverType,
        transactor: async (value) => ({ [_resolver]: value }),
      };
    }

    if (typeof _resolver === "function") {
      // @ts-ignore
      const resolver: TFieldAST["set"] = {};

      _resolver({
        pre: (arg) => (transactor) =>
          Object.assign(resolver, { stage: "pre", arg, transactor }),
        post: (arg) => (transactor) =>
          Object.assign(resolver, { stage: "post", arg, transactor }),
      });

      return resolver;
    }
  })();

  const orderTarget = ((): TFieldAST["orderTarget"] => {
    if (field.orderTarget) return field.orderTarget;

    if (type._is !== "scalar") return;
    const _resolver = "get" in field ? field.get : field.alias;

    if (!_resolver) return fieldName;

    if (typeof _resolver === "string") return _resolver;
  })();

  const filterTarget = ((): TFieldAST["filterTarget"] => {
    if (field.filterTarget) return field.filterTarget;

    const _resolver = "get" in field ? field.get : field.alias;

    if (!_resolver) return fieldName;

    if (typeof _resolver === "string") return _resolver;
  })();

  return {
    ...field,
    type,
    get: resolverGet,
    set: resolverSet,
    orderTarget,
    filterTarget,
  };
}

export default Field;
