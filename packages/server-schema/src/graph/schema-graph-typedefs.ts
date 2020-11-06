import {
  Types,
  TType,
  TField,
  TFilter,
  TSourceTree,
} from "./schema-graph-types";

const clean = (source: string) => source;

function getType(type: TType) {
  return type.array
    ? `[${type.name}!]${type.nullable ? "" : "!"}`
    : `${type.name}${type.nullable ? "" : "!"}`;
}

function getTypeDictArgs(args: Record<any, TType>) {
  return Object.entries(args)
    .map(([key, type]) => `${key}: ${getType(type)}`)
    .join(" ");
}

function mapGraphFieldsTypeDefs(fields: Map<any, TField>) {
  const acc = new Set<string>();
  for (const [fieldName, field] of fields) {
    const resolverGet = field.resolver.get;
    if (!resolverGet) continue;
    const { args } = resolverGet;
    const fieldArgs = Object.keys(args).length
      ? `(${getTypeDictArgs(args)})`
      : "";
    const fieldType = getType(field.type);
    acc.add(`${fieldName}${fieldArgs}: ${fieldType}`);
  }
  return [...acc.values()].join("\n");
}

function mapGraphFieldsTypeDefsInput(
  fields: Map<any, TField>,
  partial = false
) {
  const acc = new Set<string>();
  for (const [fieldName, field] of fields) {
    if (typeof field.resolver === "string") {
      acc.add(`${fieldName}: ${getType(field.type)}`);
      continue;
    }

    if (field.resolver?.set === null) continue;
    if (field.resolver?.set) continue;

    // use defined type from resolver/transactor, otherwise if scalar use field
    // type, default to ID scalar
    const arg =
      (typeof field.resolver?.set === "object" && field.resolver?.set.arg) ||
      field.type.__is === "complex"
        ? Types.ID
        : (field.type as TType<unknown, "scalar">);

    const _arg =
      typeof arg === "object"
        ? { ...arg, nullable: partial ? false : arg.nullable }
        : arg;
    acc.add(`${fieldName}: ${getType(_arg)}`);
  }
  return [...acc.values()].join("\n");
}

function mapGraphFieldsTypeDefsFilters(
  fields: Map<any, TField>,
  filters: Map<any, TFilter>
) {
  const acc = new Set<string>();
  for (const [fieldName, field] of fields) {
    if (typeof field.resolver !== "string" && field.resolver?.get === null)
      continue;

    if (field.type.__is !== "scalar") continue;

    const typeGraph = getType(field.type);
    acc.add(`${fieldName}_eq: ${typeGraph}`);
    acc.add(`${fieldName}_ne: ${typeGraph}`);
    acc.add(`${fieldName}_gt: ${typeGraph}`);
    acc.add(`${fieldName}_gte: ${typeGraph}`);
    acc.add(`${fieldName}_lt: ${typeGraph}`);
    acc.add(`${fieldName}_lte: ${typeGraph}`);
  }

  for (const [filterName, filter] of filters) {
    acc.add(`${filterName}: ${getType(filter.arg)}`);
  }

  return [...acc.values()].join("\n");
}

export default function TypeDefs(ast: TSourceTree) {
  const { name, typeDefs, limitDefault, limitMaxDefault } = ast;

  const fields = new Map(Object.entries(ast.fields));
  const filters = new Map(Object.entries(ast.filters));

  const graphFieldsTypeDefs = mapGraphFieldsTypeDefs(fields);
  const graphFieldsTypeDefsInput = mapGraphFieldsTypeDefsInput(fields);
  const graphFieldsTypeDefsInputPartial = mapGraphFieldsTypeDefsInput(
    fields,
    true
  );
  const graphFieldsTypeDefsFilters = mapGraphFieldsTypeDefsFilters(
    fields,
    filters
  );

  const Root = clean(`
      type ${name} {
        ${graphFieldsTypeDefs}
      }
      type ${name}ManyResult {
        items: [${name}!]!
        total: Int
        cursor: String
      }
      input ${name}ManyFilters {
        ${graphFieldsTypeDefsFilters}
      }
      input ${name}Input {
        ${graphFieldsTypeDefsInput}
      }
      input ${name}InputPartial {
        id: ID!
        ${graphFieldsTypeDefsInputPartial}
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
