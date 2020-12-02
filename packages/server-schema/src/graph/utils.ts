import {
  TGraphTypeDefs,
  TGraphResolvers,
  TGraphNodeType,
} from "../types/types-graph";
import { TResolver } from "../types/types-graphql";

export function mergeTypeDefs(
  manyTypeDefs: TGraphTypeDefs[],
  nodeType: TGraphNodeType = "Root"
) {
  return manyTypeDefs.reduce<string>(
    (acc, oneTypeDefs) => `${acc}\n${oneTypeDefs[nodeType]}`,
    ""
  );
}

export function mergeResolvers(
  manyResolvers: TGraphResolvers[],
  nodeType: TGraphNodeType = "Root"
) {
  return manyResolvers.reduce<
    Record<string, TResolver | Record<string, TResolver>>
  >((acc, oneResolvers) => Object.assign(acc, oneResolvers[nodeType]), {});
}
