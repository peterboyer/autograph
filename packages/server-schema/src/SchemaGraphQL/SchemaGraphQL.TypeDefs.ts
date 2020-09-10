import graphql from "graphql";
import {
  IIOC,
  IModel,
  IModelField,
  ISchemaTypeDefs,
} from "./SchemaGraphQL.types";
const { print, parse } = graphql;

const clean = (source: string) => print(parse(source));

export default function TypeDefs(ioc: IIOC) {
  const { mapType } = ioc;

  function getGraphType(type: string) {
    return mapType.get(type) || type;
  }

  function stringGraphFieldJoinArgs(args: Record<any, string>) {
    return Object.entries(args)
      .map(([key, type]) => `${key}: ${type}`)
      .join(",");
  }

  function mapGraphFieldsTypeDefs(fields: Map<string, IModelField>) {
    const acc = new Set<string>();
    for (const [fieldName, field] of fields) {
      if (field.private) continue;
      if (field.getter === null) continue;
      const typeGraph = getGraphType(field.type);
      acc.add(
        `${fieldName}${
          field.args ? `(${stringGraphFieldJoinArgs(field.args)})` : ""
        }: ${field.many ? `[${typeGraph}!]!` : `${typeGraph}`}${
          field.nullable === false ? "!" : ""
        }`
      );
    }
    return [...acc.values()].join("\n");
  }

  function mapGraphFieldsTypeDefsInput(fields: Map<string, IModelField>) {
    const acc = new Set<string>();
    for (const [fieldName, field] of fields) {
      if (field.private) continue;
      if (field.primary) continue;
      if (field.setter === null) continue;
      const typeGraph = field.relationship ? "ID" : getGraphType(field.type);
      acc.add(
        `${fieldName}: ${field.many ? `[${typeGraph}!]` : `${typeGraph}`}`
      );
    }
    return [...acc.values()].join("\n");
  }

  function mapGraphFieldsTypeDefsFilters(fields: Map<string, IModelField>) {
    const acc = new Set<string>();
    for (const [fieldName, field] of fields) {
      if (field.private) continue;
      if (field.primary) continue;
      if (field.getter === null) continue;
      if (field.many) continue;

      if (field.relationship) continue;
      // const typeGraph = field.relationship ? "ID" : getGraphType(field.type);

      const typeGraph = getGraphType(field.type);
      acc.add(`${fieldName}_eq: ${typeGraph}`);
      acc.add(`${fieldName}_ne: ${typeGraph}`);
      acc.add(`${fieldName}_gt: ${typeGraph}`);
      acc.add(`${fieldName}_gte: ${typeGraph}`);
      acc.add(`${fieldName}_lt: ${typeGraph}`);
      acc.add(`${fieldName}_lte: ${typeGraph}`);
    }
    return [...acc.values()].join("\n");
  }

  return function (model: IModel): ISchemaTypeDefs {
    const { name, fields: _fields } = model;

    const fields = new Map(Object.entries(_fields));
    const graphFieldsTypeDefs = mapGraphFieldsTypeDefs(fields);
    const graphFieldsTypeDefsInput = mapGraphFieldsTypeDefsInput(fields);
    const graphFieldsTypeDefsFilters = mapGraphFieldsTypeDefsFilters(fields);

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
      input ${name}InputID {
        id: ID!
        ${graphFieldsTypeDefsInput}
      }
    `);

    const Query = `
      ${name}(id: ID!): ${name}!
      ${name}_many(
        cursor: String
        order: String
        filters: ${name}ManyFilters
        limit: Int
      ): ${name}ManyResult!
    `;

    const Mutation = `
      ${name}_create(data: [${name}Input!]!): [${name}!]!
      ${name}_update(data: [${name}InputID!]!): [${name}!]!
      ${name}_delete(ids: [ID!]!): [ID!]!
    `;

    return {
      Root,
      Query,
      Mutation,
    };
  };
}
