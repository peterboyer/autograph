import { TSchemaAST } from "../types/types-schema-ast";
import TOptions from "./ast-resolvers/ast-resolvers-options";
import TypeDefs from "./ast-typedefs/ast-typedefs";
import Resolvers from "./ast-resolvers/ast-resolvers";

function Graph(options: TOptions) {
  return function graph(ast: TSchemaAST) {
    return {
      typeDefs: TypeDefs(ast),
      resolvers: Resolvers(ast, options),
    };
  };
}

export default Graph;
