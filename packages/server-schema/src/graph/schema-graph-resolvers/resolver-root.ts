import { TField, TResolver } from "../schema-graph-types";
import TResolverIOC from "./resolver-ioc";

export function ResolverRoot(ioc: TResolverIOC) {
  async function nodeTypeValueResolver(node: TField, value: any, resolverArgs: Parameters<TResolver>) {
    const { type } = node;

    if (type.__is === "complex") {
      const valueResult = await ioc.queryByIdOrThrow(value, resolverArgs);
      if (!valueResult && !type.nullable) {
        throw new Error("@AS/NOT_FOUND")
      }
      return valueResult;
    }

    return value;
  }

  return function (nodes: Map<string, TField>) {
    const root: Record<any, TResolver<{ [key: string]: any }>> = {};

    for (const [nodeName, node] of nodes) {
      const resolverGet = node.resolver.get;
      if (resolverGet) {
        root[nodeName] = async (...resolverArgs) => {
          const { transactor } = resolverGet;
          const result = await transactor()(...resolverArgs);
          if (!result && !node.type.nullable) {
            throw new Error("@AS/NOT_FOUND")
          }
          if ()
          return result;
        }
      };
    }

    return root;
  };
}

export default ResolverRoot;
