import { Resolver } from "./resolver";

export type Node = "root" | "query" | "mutation";

export type Graph = {
  typeDefs: Record<Node, string>;
  resolvers: Record<Node, Record<string, Record<string, Resolver> | Resolver>>;
};
