type TypeDefsNodeType = "Root" | "Query" | "Mutation";
type SchemaTypeDefs = { Root: string; Query: string; Mutation: string };
type SchemaResolvers = { Root: {}; Query: {}; Mutation: {} };

/**
 * Convenience function to return merge many schemas' typeDefs.
 * @function
 * @param {SchemaResult[]} schemas
 *    Array of schemas to be iterated on.
 * @param {string} [node="Root"]
 *    TypeDefs node to reference when iterating over schemas.
 */
export const mergeTypeDefs = (
  allTypeDefs: SchemaTypeDefs[],
  node: TypeDefsNodeType = "Root"
) => {
  return allTypeDefs
    .map((typeDefs: SchemaTypeDefs) => typeDefs[node])
    .join("\n");
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
  allResolvers: SchemaResolvers[],
  node: TypeDefsNodeType = "Root"
) => {
  return allResolvers.reduce((acc, resolvers) => {
    return Object.assign(acc, resolvers[node]);
  }, {});
};
