import { TName, TNodes, TOptions, TSchema } from "./schema-graph-types";

// TODO typedefs with raw node: with Root Query Mutation as uncompiled strings
// TODO typedefs append/process as arrays rather than strings, then merge to string
import TypeDefs from "./schema-graph-typedefs";
import Resolvers from "./schema-graph-resolvers";

export const create = (
  name: TName,
  nodes: TNodes,
  options: TOptions
): TSchema => {
  const typeDefs = TypeDefs(name, nodes, options);
  const resolvers = Resolvers(name, nodes, options);
  return { typeDefs, resolvers };
};

export default create;
