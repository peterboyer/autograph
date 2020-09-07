import {
  IResolverAny,
  ISchemaNodeType,
  ISchemaTypeDefs,
  ISchemaResolvers,
} from "./SchemaGraphQL.types";

/**
 * Convenience function to return merge many schemas' typeDefs.
 */
export function mergeTypeDefs(
  allTypeDefs: ISchemaTypeDefs[],
  node: ISchemaNodeType = "Root"
) {
  return allTypeDefs.map((typeDefs) => typeDefs[node]).join("\n");
}

/**
 * Convenience function to return merge many schemas' resolvers.
 */
export function mergeResolvers(
  allResolvers: ISchemaResolvers[],
  node: ISchemaNodeType = "Root"
) {
  return allResolvers.reduce((acc, resolvers) => {
    return Object.assign(acc, resolvers[node]);
  }, {} as Record<string, IResolverAny>);
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
