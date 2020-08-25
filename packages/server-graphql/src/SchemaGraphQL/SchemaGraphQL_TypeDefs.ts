import {
  IIOC,
  IModel,
  IModelField,
  ISchemaTypeDefs,
} from "./SchemaGraphQL.types";

export default function TypeDefs(ioc: IIOC) {
  const { mapType } = ioc;

  function getGraphType(type: string) {
    return mapType.get(type) || type;
  }

  function stringGraphFieldJoinArgs(args: Map<string, string>) {
    return [...args.values()].map(([key, type]) => `${key}: ${type}`).join(",");
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
        }: ${field.many ? `[${typeGraph}!]` : `${typeGraph}`}${
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

  return function (model: IModel): ISchemaTypeDefs {
    const { name, fields: _fields } = model;

    const fields = new Map(Object.entries(_fields));
    const graphFieldsTypeDefs = mapGraphFieldsTypeDefs(fields);
    const graphFieldsTypeDefsInput = mapGraphFieldsTypeDefsInput(fields);

    const Root = `
      type ${name} {
        ${graphFieldsTypeDefs}
      }
      input ${name}Input {
        ${graphFieldsTypeDefsInput}
      }
      input ${name}InputID {
        id: ID!
        ${graphFieldsTypeDefsInput}
      }
    `;

    // TODO: convert query into ${name}QueryInput with field accessors etc.
    const Query = `
      ${name}(id: ID!): ${name}!
      ${name}_many(query: String): [${name}!]!
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
