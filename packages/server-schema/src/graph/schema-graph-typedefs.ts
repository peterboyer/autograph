import {
  types,
  TType,
  TName,
  TNode,
  TNodes,
  TOptions,
  TFilter,
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
    .join(",");
}

function mapGraphFieldsTypeDefs(nodes: Map<any, TNode>) {
  const acc = new Set<string>();
  for (const [nodeName, node] of nodes) {
    if (typeof node.resolver === "string") {
      acc.add(`${nodeName}: ${getType(node.type)}`);
      continue;
    }

    if (node.resolver?.get === null) continue;

    const args =
      typeof node.resolver?.get === "object"
        ? node.resolver.get.args
        : undefined;
    acc.add(
      `${nodeName}${args ? `(${getTypeDictArgs(args)})` : ""}: ${getType(
        node.type
      )}`
    );
  }
  return [...acc.values()].join("\n");
}

function mapGraphFieldsTypeDefsInput(nodes: Map<any, TNode>, partial = false) {
  const acc = new Set<string>();
  for (const [nodeName, node] of nodes) {
    if (typeof node.resolver === "string") {
      acc.add(`${nodeName}: ${getType(node.type)}`);
      continue;
    }

    if (node.resolver?.set === null) continue;
    if (node.resolver?.set) continue;

    // use defined type from resolver/transactor, otherwise if scalar use node
    // type, default to ID scalar
    const arg =
      (typeof node.resolver?.set === "object" && node.resolver?.set.arg) ||
      node.type.__is === "complex"
        ? types.ID
        : (node.type as TType<unknown, "scalar">);

    const _arg =
      typeof arg === "object"
        ? { ...arg, nullable: partial ? false : arg.nullable }
        : arg;
    acc.add(`${nodeName}: ${getType(_arg)}`);
  }
  return [...acc.values()].join("\n");
}

function mapGraphFieldsTypeDefsFilters(
  nodes: Map<any, TNode>,
  filters: Map<any, TFilter>
) {
  const acc = new Set<string>();
  for (const [fieldName, node] of nodes) {
    if (typeof node.resolver !== "string" && node.resolver?.get === null)
      continue;

    const typeGraph = getType(node.type);
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

export default function TypeDefs(
  name: TName,
  nodes: TNodes,
  options: TOptions
) {
  const {
    filters: _filters = {},
    typeDefs,
    limitDefault,
    limitMaxDefault,
  } = options;

  const _nodes = new Map(Object.entries(nodes));
  const filters = new Map(Object.entries(_filters));

  const graphFieldsTypeDefs = mapGraphFieldsTypeDefs(_nodes);
  const graphFieldsTypeDefsInput = mapGraphFieldsTypeDefsInput(_nodes);
  const graphFieldsTypeDefsInputPartial = mapGraphFieldsTypeDefsInput(
    _nodes,
    true
  );
  const graphFieldsTypeDefsFilters = mapGraphFieldsTypeDefsFilters(
    _nodes,
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
