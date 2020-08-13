export type Context = {};

export type Errors = {
  NotFound: (schemaName: string, queryArgs?: {}) => Error;
  NotValid: (details?: {}) => Error;
};

export type GraphScalarType = string & {};

export type RawColumnType = string & {};

export type Query = {};

export type FieldName = string & {};

export type FieldResolver = (
  parent: {} | null,
  args: {} | null,
  context: {},
  info: {}
) => any;

export type FieldArgs = Map<string, GraphScalarType>;

export type Field<F = {}> = {
  type: GraphScalarType;
  virtual?: boolean;
  relationship?: boolean | string;
  many?: boolean;
  nullable?: boolean;
  private?: boolean;
  default?: any;
  args?: FieldArgs;
  getter?: FieldResolver | string | null;
  setter?: FieldResolver | string | null;
} & F;

export type Schema<S = {}, F = {}> = {
  name: string;
  fields: Map<FieldName, Field<F>>;
} & S;

export declare class Graph {
  query: Query;
  errors: Errors;
  mapGraphAlias: Map<GraphScalarType, GraphScalarType>;
  use: (adapter: GraphAdapter) => void;
}

export declare class GraphAdapter {
  _attach?: (graph: Graph) => void;
}
