export { SchemaAdapter } from "../types";
import { Schema } from "../types";

export type Knex = any;

export type IOC = {
  knex: Knex;
  mapType: Map<string, string>;
};

export type ISchema = Schema<SchemaKnexAttributes, SchemaKnexFieldAttributes>;

export type SchemaKnexAttributes = {
  constraints?: {
    unique?: string[][];
  };
};
export type SchemaKnexFieldAttributes = {
  column?: string;
  primary?: boolean;
  unique?: boolean;
  nullable?: boolean;
  default?: any;
  virtual?: boolean;
  relationship?: boolean | string;
};
