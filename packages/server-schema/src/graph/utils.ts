import { Resolver } from "../types/resolver";
import { Graph, Node } from "../types/graph";

/**
 * Combines many typedefs of nodeType into a single string (with newlines).
 */
export function mergeTypeDefs(
  manyTypeDefs: Graph["typeDefs"][],
  nodeType: Node = "root"
) {
  return manyTypeDefs.reduce<string>(
    (acc, oneTypeDefs) => `${acc}\n${oneTypeDefs[nodeType]}`,
    ""
  );
}

/**
 * Combines many resolvers of nodeType into a single object.
 */
export function mergeResolvers(
  manyResolvers: Graph["resolvers"][],
  nodeType: Node = "root"
) {
  return manyResolvers.reduce<
    Record<string, Resolver | Record<string, Resolver>>
  >((acc, oneResolvers) => Object.assign(acc, oneResolvers[nodeType]), {});
}

// export type TMiddleware = (next: Resolver) => Resolver;

// /**
//  * Recursively walk `resolvers` (resolvers|objects) and wrap with `middleware`.
//  */
// export const wrapResolvers = (
//   resolvers: Record<string, Resolver | Record<string, Resolver>>,
//   middleware: TMiddleware
// ) => {
//   const wrapObject = (
//     object: Record<string, Resolver | Record<string, Resolver>>
//   ): Record<string, Resolver> =>
//     Object.entries(object).reduce<Record<string, Resolver>>(
//       (acc, [key, value]) =>
//         Object.assign(acc, {
//           [key]:
//             typeof value === "object" ? wrapObject(value) : middleware(value),
//         }),
//       {}
//     );
//   return wrapObject(resolvers);
// };
