import { Node } from "./types/graph";
import { Resolver } from "./types/resolver";
import { Adapter } from "./types/adapter";
import { ModelAny } from "./model/model";
import { buildTypeDefs } from "./graph/build-typedefs";
import { buildResolvers } from "./graph/build-resolvers";
import { mergeTypeDefs, mergeResolvers } from "./graph/graph-utils";

type Options = {
  models: ModelAny[];
  adapter: Adapter;
  typeDefs?: Partial<Record<Node, string>>;
  resolvers?: Partial<Record<Node, Record<string, any>>>;
  wrapper?: (resolver: Resolver) => Resolver;
  wrapperExcludes?: Partial<Record<Node, string[]>>;
};

export class Autograph {
  typeDefs: string;
  resolvers: Record<"Query" | "Mutation", Record<string, Resolver>>;

  constructor(options: Options) {
    const { models, adapter } = options;

    const modelsTypeDefs = models.map((model) => buildTypeDefs(model));
    const modelsResolvers = models.map((model) =>
      buildResolvers(model, adapter)
    );

    this.typeDefs = `
      ${mergeTypeDefs(modelsTypeDefs)}
      type Query {
        ${mergeTypeDefs(modelsTypeDefs, "query")}
      }
      type Mutation {
        ${mergeTypeDefs(modelsTypeDefs, "mutation")}
      }
    `;

    this.resolvers = {
      ...mergeResolvers(modelsResolvers),
      Query: {
        ...mergeResolvers(modelsResolvers, "query"),
      },
      Mutation: {
        ...mergeResolvers(modelsResolvers, "mutation"),
      },
    };
  }
}
