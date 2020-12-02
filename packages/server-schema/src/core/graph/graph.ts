import { TGraphTypeDefs, TGraphResolvers } from "../types/types-graph";
import TOptions from "./ast-resolvers/ast-resolvers-options";
import TypeDefs from "./ast-typedefs/ast-typedefs";
import Resolvers from "./ast-resolvers/ast-resolvers";
import Model from "../model";
export { TOptions as TGraphOptions } from "./ast-resolvers/ast-resolvers-options";

export type TGraph = {
  typeDefs: TGraphTypeDefs;
  resolvers: TGraphResolvers;
};

export class Graph {
  typeDefs: ReturnType<typeof TypeDefs>;
  resolvers: ReturnType<typeof Resolvers>;

  constructor(model: Model<any, any>, options: TOptions) {
    const { ast } = model;

    this.typeDefs = TypeDefs(ast);
    this.resolvers = Resolvers(ast, options);
  }
}

export default Graph;
