import { TResolver } from "../types/types-graphql";
import {
  TGraph,
  TGraphNodeType,
  TGraphTypeDefs,
  TGraphResolvers,
} from "../types/types-graph";

export function mapGraphs(graphs: TGraph[]) {
  const _typeDefs = graphs.map((graph) => graph.typeDefs);
  const _resolvers = graphs.map((graph) => graph.resolvers);
  return {
    typeDefs: `
      ${mergeTypeDefs(_typeDefs)}
      type Query {
        ${mergeTypeDefs(_typeDefs, "Query")}
      }
      type Mutation {
        ${mergeTypeDefs(_typeDefs, "Mutation")}
      }
    `,
    resolvers: {
      ...mergeResolvers(_resolvers),
      Query: {
        ...mergeResolvers(_resolvers, "Query"),
      },
      Mutation: {
        ...mergeResolvers(_resolvers, "Mutation"),
      },
    },
  };
}

/**
 * Convenience function to return merge many schemas' typeDefs.
 */
export function mergeTypeDefs(
  allTypeDefs: TGraphTypeDefs[],
  node: TGraphNodeType = "Root"
) {
  return allTypeDefs.map((typeDefs) => typeDefs[node]).join("\n");
}

/**
 * Convenience function to return merge many schemas' resolvers.
 */
export function mergeResolvers(
  resolversMaps: TGraphResolvers[],
  node: TGraphNodeType = "Root"
) {
  const merged: Record<string, TResolver> = {};

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
