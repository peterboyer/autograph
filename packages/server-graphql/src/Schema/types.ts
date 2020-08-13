import { Schema } from "../types";
export { Schema } from "../types";

export type SchemaAdapter<T> = {
  defaults?: () => {};
  mutate?: (schema: Schema) => void;
  compile: (schema: Schema) => T;
};

export type SchemaFieldName = string & {};

export type SchemaGraphQL = {
  typeDefs: {
    Root: GQLString;
    Query: GQLString;
    Mutation: GQLString;
  };
  resolvers: {
    Root: { [key: string]: GQLResolver };
    Query: { [key: string]: GQLResolver };
    Mutation: { [key: string]: GQLResolver };
  };
};

export type GQLString = string & {};
export type GQLResolver = (
  parent?: {},
  args?: {},
  context?: {},
  info?: {}
) => any;
