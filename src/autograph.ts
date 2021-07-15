import { source } from "common-tags";
import { buildSchema as graphqlBuildSchema, GraphQLSchema } from "graphql";
import { Resolver } from "./resolver/resolver";

type Schema = GraphQLSchema;
type RootValue = { Query: Record<string, any>; Mutation: Record<string, any> };

export class Autograph {
  #resolvers: Resolver[];

  constructor() {
    this.#resolvers = [];
  }

  use(source: Resolver): this {
    this.#resolvers.push(source);
    return this;
  }

  buildSchema(): Schema {
    const schema = graphqlBuildSchema(source`
      type Query {
        foo: String
      }
    `);
    return schema;
  }

  buildRootValue(): RootValue {
    const rootValue = {
      Query: {},
      Mutation: {},
    };
    return rootValue;
  }
}
