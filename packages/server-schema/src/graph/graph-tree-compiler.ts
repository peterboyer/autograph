import { TSchema, TSourceTree } from "./schema-graph-types";

// TODO typedefs with raw node: with Root Query Mutation as uncompiled strings
// TODO typedefs append/process as arrays rather than strings, then merge to string
import TypeDefs from "./schema-graph-typedefs";
import Resolvers from "./schema-graph-resolvers";

export const create = (tree: TSourceTree): TSchema => {
  const typeDefs = TypeDefs(tree);
  const resolvers = Resolvers(tree);
  return { typeDefs, resolvers };
};

export default create;
