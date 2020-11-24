import { TAST } from "../../types/types-ast";
import { TGraphTypeDefs } from "../../types/types-graph";
import { mapFields } from "./map-fields";
import { mapFieldsInput } from "./map-fields-input";
import { mapFieldsFilters } from "./map-fields-filters";

import * as DOCSTRINGS from "./ast-typedefs-docs";

const identity = <T>(a: T) => a;

export default function TypeDefs(ast: TAST): TGraphTypeDefs {
  const { name, typeDefs, limitDefault, limitMax } = ast;

  const fields = new Map(Object.entries(ast.fields));
  const filters = new Map(Object.entries(ast.filters));

  const root = mapFields(fields);
  const rootInput = mapFieldsInput(fields);
  const rootInputPartial = mapFieldsInput(fields, true);
  const rootFilters = mapFieldsFilters(filters);

  const hasFilters = !!rootFilters;

  // TODO: from options
  const useDocumentation = false;
  const $ = useDocumentation;

  const ROOT = `
    type ${name} {
      ${root}
    }`;
  const ROOT_LIST = `
    type ${name}List {
      items: [${name}!]!
      total: Int
      cursor: String
    }`;
  const ROOT_CREATE_INPUT = `
    input ${name}CreateInput {
      ${rootInput}
    }`;
  const ROOT_UPDATE_INPUT = `
    input ${name}UpdateInput {
      id: ID!
      ${rootInputPartial}
    }`;
  const ROOT_FILTERS = `
    input ${name}Filters {
      ${rootFilters}
    }`;
  const ROOT_INJECTED = typeDefs?.Root || "";

  const Root = [
    ROOT,
    ROOT_LIST,
    ROOT_CREATE_INPUT,
    ROOT_UPDATE_INPUT,
    hasFilters && ROOT_FILTERS,
    ROOT_INJECTED,
  ]
    .filter(identity)
    .join("\n");

  const QUERY_ONE = `
    ${name}(id: ID!): ${name}!`;
  const QUERY_MANY = `
    ${name}Many(
      cursor: String
      order: String
      ${hasFilters ? `filters: ${name}Filters` : ""}
      limit: Int
    ): ${name}List!`;
  const QUERY_INJECTED = typeDefs?.Query || "";

  const Query = [
    $ && DOCSTRINGS.QUERY_ONE(name),
    QUERY_ONE,
    $ && DOCSTRINGS.QUERY_MANY(name, limitDefault, limitMax),
    QUERY_MANY,
    QUERY_INJECTED,
  ]
    .filter(identity)
    .join("\n");

  const MUTATION_CREATE = `
    ${name}Create(
      data: [${name}CreateInput!]!
    ): [${name}!]!`;
  const MUTATION_UPDATE = `
    ${name}Update(
      data: [${name}UpdateInput!]!
    ): [${name}!]!`;
  const MUTATION_DELETE = `
    ${name}Delete(
      ids: [ID!]!
    ): [ID!]!`;
  const MUTATION_INJECTED = typeDefs?.Mutation || "";

  const Mutation = [
    $ && DOCSTRINGS.MUTATION_CREATE(name),
    MUTATION_CREATE,
    $ && DOCSTRINGS.MUTATION_UPDATE(name),
    MUTATION_UPDATE,
    $ && DOCSTRINGS.MUTATION_DELETE(),
    MUTATION_DELETE,
    MUTATION_INJECTED,
  ]
    .filter(identity)
    .join("\n");

  return {
    Root,
    Query,
    Mutation,
  };
}
