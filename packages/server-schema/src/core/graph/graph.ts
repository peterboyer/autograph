import { TAST } from "../types/types-ast";
import { TGraphTypeDefs, TGraphResolvers } from "../types/types-graph";
import TOptions from "./ast-resolvers/ast-resolvers-options";
import TypeDefs from "./ast-typedefs/ast-typedefs";
import Resolvers from "./ast-resolvers/ast-resolvers";
export { TOptions as TGraphOptions } from "./ast-resolvers/ast-resolvers-options";

export type TGraph = {
  typeDefs: TGraphTypeDefs;
  resolvers: TGraphResolvers;
};

export function Graph(ast: TAST, options: TOptions): TGraph {
  return {
    typeDefs: TypeDefs(ast),
    resolvers: Resolvers(ast, options),
  };
}

export default Graph;
