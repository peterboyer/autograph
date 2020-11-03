import { TNode, TResolver } from "../schema-graph-types";
import TResolverIOC from "./resolver-ioc";

export function ResolverRoot(ioc: TResolverIOC) {
  async function nodeTypeValueResolver(node: TNode, value: any, resolverArgs: Parameters<TResolver>) {
    const { type } = node;

    if (type.__is === "complex") {
      const valueResult = await ioc.queryByIdOrThrow(value, resolverArgs);
      if (!valueResult && !type.nullable) {
        return ioc.errors.NotFound();
      }
      return valueResult;
    }

    return value;
  }

  function nodeValueResolver(node: TNode, nodeName: string): TResolver | null {
    const { resolver } = node;

    if (!resolver) {
      return async (...resolverArgs) => {
        const [source] = resolverArgs;
        return nodeTypeValueResolver(node, source[nodeName], resolverArgs);
      };
    }

    if (typeof resolver === "string") {
      const key = resolver;
      return async (...resolverArgs) => {
        const [source] = resolverArgs;
        return source[key];
      };
    }

    if (resolver.get === undefined) {
      return async (...resolverArgs) => {
        const [source] = resolverArgs;
        return source[nodeName];
      };
    }

    if (resolver.get === null) {
      return null;
    }

    if (typeof resolver.get === "string") {
      const key = resolver.get;
      return async (...resolverArgs) => {
        const [source] = resolverArgs;
        return source[key];
      };
    }

    if (typeof resolver.get === "object") {
      const transactor = resolver.get.transactor;
      return async (...resolverArgs) => {
        // TODO: add transaction to graphql context
        const [, , { transaction }] = resolverArgs;
        return transactor(transaction)(...resolverArgs);
      };
    }

    return null;
  }

  return function (nodes: Map<string, TNode>) {
    const root: Record<any, TResolver<{ [key: string]: any }>> = {};

    for (const [nodeName, node] of nodes) {
      const resolver = nodeValueResolver(nodeName, node);
      if (resolver) root[nodeName] = resolver;

        if (typeof node.getter === "function") {
          const result = await node.getter(...resolverArgs);
          if (!result && node.nullable === false)
            throw errors.NotFound(node.type, args, resolverArgs);
          return result;
        }

        if (node.relationship) {

          if (!result && node.nullable === false)
            throw errors.NotFound(node.type, args, resolverArgs);
          return result;
        }

        const value = source[key] || null;
        return value;
      };
    }

  };
}

export default ResolverRoot;
