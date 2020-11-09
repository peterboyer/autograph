import { TSchemaAST } from "../../types/types-schema-ast";
import { mapFields } from "./ast-map-fields";
import { mapFieldsInput } from "./ast-map-fields-input";
import { mapFieldsFilters } from "./ast-map-fields-filters";

const clean = (source: string) => source;

export default function TypeDefs(ast: TSchemaAST) {
  const { name, typeDefs, limitDefault, limitMaxDefault } = ast;

  const fields = new Map(Object.entries(ast.fields));
  const filters = new Map(Object.entries(ast.filters));

  const root = mapFields(fields);
  const rootInput = mapFieldsInput(fields);
  const rootInputPartial = mapFieldsInput(fields, true);
  const rootFilters = mapFieldsFilters(fields, filters);

  const Root = clean(`
      type ${name} {
        ${root}
      }
      type ${name}ManyResult {
        items: [${name}!]!
        total: Int
        cursor: String
      }
      input ${name}Input {
        ${rootInput}
      }
      input ${name}InputPartial {
        id: ID!
        ${rootInputPartial}
      }
      input ${name}ManyFilters {
        ${rootFilters}
      }

      ${typeDefs?.Root || ""}
    `);

  const Query = `
      # Accepts an \`id\` to return it's corresponding \`${name}\`. Throws if
      # not found.
      ${name}(id: ID!): ${name}!

      # Accepts a combination of one or many options to paginate through many
      # \`${name}\` items.
      # - \`cursor\`, used from a previous request to the get page of items. If
      # specified, all other arguments are ignored.
      # - \`order\`, used to order items (e.g. "fieldA:asc", "fieldB:desc")
      # - \`filters\`, a map of filters and their values used to conditionally
      # filter items. See \`${name}ManyFilters\` for available filters and value
      # types.
      # - \`limit\`, specify how many items per page
      # (default: \`${limitDefault}\`, max: \`${limitMaxDefault}\`)
      #
      # Returns \`${name}ManyResult\` with a \`cursor\` value (to be used in a
      # subsequent request to fetch the next page of items, \`null\` if no more
      # items), \`total\` (to denote how many items exist), and \`items\` of
      # \`${name}\`.
      ${name}_many(
        cursor: String
        order: String
        filters: ${name}ManyFilters
        limit: Int
      ): ${name}ManyResult!

      ${typeDefs?.Query || ""}
    `;

  const Mutation = `
      # Accepts \`data\` as an array of \`${name}Input\` to persist, and
      # returns those new items.
      ${name}_create(data: [${name}Input!]!): [${name}!]!

      # Accepts \`data\` as an array of \`${name}InputPartial\` to update items
      # by the given \`{ id }\` field, and returns those updated items.
      ${name}_update(data: [${name}InputPartial!]!): [${name}!]!

      # Accepts \`ids\` as an array of \`ID\`s and returns those \`ID\`s after
      # deletion.
      ${name}_delete(ids: [ID!]!): [ID!]!

      ${typeDefs?.Mutation || ""}
    `;

  return {
    Root,
    Query,
    Mutation,
  };
}
