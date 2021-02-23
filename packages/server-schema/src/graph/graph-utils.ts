import { Graph, Node } from "../types/graph";
import { Resolver } from "../types/resolver";

/**
 * Convenience function to return merge many schemas' typeDefs.
 */
export function mergeTypeDefs(
  allTypeDefs: Graph["typeDefs"][],
  node: Node = "root"
) {
  return allTypeDefs.map((typeDefs) => typeDefs[node]).join("\n");
}

/**
 * Convenience function to return merge many schemas' resolvers.
 */
export function mergeResolvers(
  resolversMaps: Graph["resolvers"][],
  node: Node = "root"
) {
  const merged: Record<string, Resolver> = {};

  for (const resolverMap of resolversMaps) {
    Object.assign(merged, resolverMap[node]);
  }

  return merged;
}

/**
 * Convenience function to wrap an object of resolvers (e.g. for requiring auth)
 * returning an identitically shaped object of wrapped resolvers.
 */
export function wrapResolvers<T>(
  resolvers: Record<any, T>,
  wrapper: (resolver: T) => T
) {
  return Object.entries(resolvers).reduce((acc, [key, resolver]) => {
    return Object.assign(acc, { [key]: wrapper(resolver) });
  }, {} as typeof resolvers);
}
