import { TModel as TSchema, TArgs as TSchemaOptions } from "./model-types";
import { TAST } from "../types/types-ast";
import { TScalar, Types } from "../types/types-types";
import Field from "./model-field";
import Filter from "./model-filter";

import { TGraph } from "../types/types-graph";
import TGraphOptions from "../graph/ast-resolvers/ast-resolvers-options";
import TypeDefs from "../graph/ast-typedefs/ast-typedefs";
import Resolvers from "../graph/ast-resolvers/ast-resolvers";

const SCALAR_OPERATORS = ["eq", "ne", "gt", "gte", "lt", "lte"];
const OBJECT_OPERATORS = ["eq", "ne", "in", "ni"];

type TSchemaSource = Record<string, any>;
type ModelOptions = { Context: any; Query: any };

export class Model<
  SchemaSource extends TSchemaSource,
  SchemaOptions extends ModelOptions = ModelOptions,
  SchemaArgs extends TSchemaOptions = {
    Source: SchemaSource;
    Context: SchemaOptions["Context"];
    Query: SchemaOptions["Query"];
  },
  Schema extends TSchema<SchemaArgs> = TSchema<SchemaArgs>
> {
  ast: TAST;

  constructor(schemaName: Schema["name"]) {
    this.ast = {
      name: schemaName,
      fields: {},
      filters: {},
      hooks: {
        preUpsert: null,
        postUpsert: null,
        preDelete: null,
        postDelete: null,
      },
      query: {
        one: null,
        many: null,
        default: null,
      },
      typeDefs: {},
      limitDefault: 20,
      limitMax: 50,
    };
  }

  fields(schemaFields: Schema["fields"]) {
    Object.entries(schemaFields).forEach(([fieldName, fieldDefinition]) => {
      this.ast.fields[fieldName] = Field(fieldDefinition, fieldName);

      const field = this.ast.fields[fieldName];

      const target = field.filterTarget;
      if (!target) return;

      const operators =
        field.type._is === "scalar"
          ? SCALAR_OPERATORS
          : field.type._is === "object"
          ? OBJECT_OPERATORS
          : [];

      operators.forEach((operator) => {
        const filterName = `${fieldName}_${operator}`;

        // skip if already defined
        if (this.ast.filters[filterName]) return;

        let arg = (field.type._is === "scalar"
          ? field.type
          : Types.ID) as TScalar;

        if (["in", "ni"].includes(operator)) {
          // @ts-ignore
          if ("List" in arg) arg = arg.List;
        }

        this.ast.filters[filterName] = {
          stage: "pre",
          arg,
          transactor: (value, query) => {
            if (!("id" in query || "cursor" in query)) {
              query.filters = query.filters || [];
              query.filters.push({
                target,
                operator,
                value,
              });
            }
            return query;
          },
        };
      });
    });

    return this;
  }

  filters(schemaFilters: Schema["filters"]) {
    Object.entries(schemaFilters || {}).forEach(([filterName, filter]) => {
      this.ast.filters[filterName] = Filter(filter);
    });

    return this;
  }

  hooks(schemaHooks: Partial<Schema["hooks"]>) {
    Object.assign(this.ast.hooks, schemaHooks);

    return this;
  }

  query(schemaQuery: Partial<Schema["query"]>) {
    Object.assign(this.ast.query, schemaQuery);

    return this;
  }

  typeDefs(schemaTypeDefs: Partial<Schema["typeDefs"]>) {
    Object.assign(this.ast.typeDefs, schemaTypeDefs);

    return this;
  }

  limitDefault(schemaLimitDefault: Schema["limitDefault"]) {
    this.ast.limitDefault = schemaLimitDefault;

    return this;
  }

  limitMax(schemaLimitMax: Schema["limitMax"]) {
    this.ast.limitMax = schemaLimitMax;

    return this;
  }

  toGraph(options: TGraphOptions<SchemaArgs["Context"]>): TGraph {
    return {
      typeDefs: TypeDefs(this.ast),
      resolvers: Resolvers(this.ast, options),
    };
  }

  toString() {
    return this.ast.name;
  }
}

export default Model;
