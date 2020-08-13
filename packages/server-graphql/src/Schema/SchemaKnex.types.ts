export { SchemaAdapter } from "./types";
import { Schema, SchemaFieldName } from "./types";

export type Knex = any;

export type IOC = {
  knex: Knex;
  mapType: Map<string, string>;
};

export type ISchema = Schema<SchemaKnexAttributes, SchemaKnexFieldAttributes>;

export type SchemaKnexAttributes = {
  constraints?: {
    unique?: Set<Set<SchemaFieldName>>;
  };
};
export type SchemaKnexFieldAttributes = {
  column?: string;
  primary?: boolean;
  unique?: boolean;
};
