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
  const rootFilters = mapFieldsFilters(fields, filters);

  const hasFilters = !!rootFilters;

  // TODO: from options
  const useDocumentation = false;
  const $ = useDocumentation;

  const ROOT = `
    type ${name} {
      ${root}
    }`;
  const ROOT_PAGE = `
    type ${name}Page {
      items: [${name}!]!
      total: Int
      cursor: String
    }`;
  const ROOT_CREATE = `
    input ${name}Create {
      ${rootInput}
    }`;
  const ROOT_UPDATE = `
    input ${name}Update {
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
    ROOT_PAGE,
    ROOT_CREATE,
    ROOT_UPDATE,
    hasFilters && ROOT_FILTERS,
    ROOT_INJECTED,
  ]
    .filter(identity)
    .join("\n");

  const QUERY_ONE = `
    ${name}(id: ID!): ${name}!`;
  const QUERY_MANY = `
    ${name}_many(
      cursor: String
      order: String
      ${hasFilters ? `filters: ${name}Filters` : ""}
      limit: Int
    ): ${name}Page!`;
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
    ${name}_create(
      data: [${name}Create!]!
    ): [${name}!]!`;
  const MUTATION_UPDATE = `
    ${name}_update(
      data: [${name}Update!]!
    ): [${name}!]!`;
  const MUTATION_DELETE = `
    ${name}_delete(
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
