import { TResolver } from "./types-graphql";

export type TGraphNodeType = "Root" | "Query" | "Mutation";
export type TGraphTypeDefs = Record<TGraphNodeType, string>;
export type TGraphResolvers = Record<
  TGraphNodeType,
  Record<string, TResolver | Record<string, TResolver>>
>;

export type TGraph = {
  typeDefs: TGraphTypeDefs;
  resolvers: TGraphResolvers;
};
