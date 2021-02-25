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
  return resolversMaps.reduce(
    (acc, resolverMap) => Object.assign(acc, resolverMap[node]),
    {} as Record<string, Resolver>
  );
}

/**
 * Convenience function to wrap an object of resolvers (e.g. for requiring auth)
 * returning an identitically shaped object of wrapped resolvers.
 */
export function wrapResolvers(
  resolvers: Record<string, Resolver>,
  wrapper: (resolver: Resolver) => Resolver
) {
  return Object.entries(resolvers).reduce(
    (acc, [key, resolver]) => Object.assign(acc, { [key]: wrapper(resolver) }),
    {} as Record<string, Resolver>
  );
}
