import {
  ISchemaNode,
  ISchemaTypeDefs,
  ISchemaResolvers,
} from "./SchemaGraphQL.types";

/**
 * Convenience function to return merge many schemas' typeDefs.
 * @function
 * @param {SchemaResult[]} schemas
 *    Array of schemas to be iterated on.
 * @param {string} [node="Root"]
 *    TypeDefs node to reference when iterating over schemas.
 */
export const mergeTypeDefs = (
  allTypeDefs: ISchemaTypeDefs[],
  node: ISchemaNode = "Root"
) => {
  return allTypeDefs.map((typeDefs) => typeDefs[node]).join("\n");
};

/**
 * Convenience function to return merge many schemas' resolvers.
 * @function
 * @param {SchemaResult[]} schemas
 *    Array of schemas to be iterated on.
 * @param {string} [node="Root"]
 *    Resolvers node to reference when iterating over schemas.
 */
export const mergeResolvers = (
  allResolvers: ISchemaResolvers[],
  node: ISchemaNode = "Root"
) => {
  return allResolvers.reduce((acc, resolvers) => {
    return Object.assign(acc, resolvers[node]);
  }, {});
};
