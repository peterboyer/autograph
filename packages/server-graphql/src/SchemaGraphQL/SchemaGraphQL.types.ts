import { Schema, Field } from "../types";

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

export type ISchemaGraphQL = SchemaGraphQL;

export type IOC = {
  mapType: Map<string, string>;
  queryById: (tableName: string, id: any) => any;
  errors: {
    NotFound: (tableName: string, queryArgs?: {}) => Error;
    NotValid: (details?: {}) => Error;
  };
};

export type ISchema = Schema<
  SchemaGraphQLAttributes,
  SchemaGraphQLFieldAttributes
>;

export type IField = Field<SchemaGraphQLFieldAttributes>;

export type GQLString = string & {};
export type GQLResolver = (
  parent?: {},
  args?: {},
  context?: {},
  info?: {}
) => any;

export type SchemaGraphQLAttributes = {};
export type SchemaGraphQLFieldAttributes = {
  virtual?: boolean;
  relationship?: boolean | string;
  many?: boolean;
  primary?: boolean;
  nullable?: boolean;
  private?: boolean;
  args?: Map<string, string>;
  getter?: GQLResolver | string | null;
  setter?: GQLResolver | string | null;
};

export type TypeDefsNodeType = "Root" | "Query" | "Mutation";
export type SchemaTypeDefs = { Root: string; Query: string; Mutation: string };
export type SchemaResolvers = { Root: {}; Query: {}; Mutation: {} };
