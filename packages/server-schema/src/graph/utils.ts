import { TResolver } from "../types/types-graphql";
import {
  TGraphTypeDefs,
  TGraphResolvers,
  TGraphNodeType,
} from "../types/types-graph";

/**
 * Combines many typedefs of nodeType into a single string (with newlines).
 */
export function mergeTypeDefs(
  manyTypeDefs: TGraphTypeDefs[],
  nodeType: TGraphNodeType = "Root"
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
  manyResolvers: TGraphResolvers[],
  nodeType: TGraphNodeType = "Root"
) {
  return manyResolvers.reduce<
    Record<string, TResolver | Record<string, TResolver>>
  >((acc, oneResolvers) => Object.assign(acc, oneResolvers[nodeType]), {});
}

export type TMiddleware = (next: TResolver) => TResolver;

/**
 * Recursively walk `resolvers` (resolvers|objects) and wrap with `middleware`.
 */
export const wrapResolvers = (
  resolvers: Record<string, TResolver | Record<string, TResolver>>,
  middleware: TMiddleware
) => {
  const wrapObject = (
    object: Record<string, TResolver | Record<string, TResolver>>
  ): Record<string, TResolver> =>
    Object.entries(object).reduce<Record<string, TResolver>>(
      (acc, [key, value]) =>
        Object.assign(acc, {
          [key]:
            typeof value === "object" ? wrapObject(value) : middleware(value),
        }),
      {}
    );
  return wrapObject(resolvers);
};
