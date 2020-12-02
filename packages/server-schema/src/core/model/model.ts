import { TModel as TSchema, TArgs as TSchemaOptions } from "./model-types";
import { TAST } from "../types/types-ast";
import { TScalar, Types } from "../types/types-types";
import Field from "./model-field";
import Filter from "./model-filter";

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
        preUpdate: null,
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
    this.ast.fields = Object.entries(schemaFields).reduce<TAST["fields"]>(
      (acc, [fieldName, field]) =>
        Object.assign(acc, {
          [fieldName]: Field(field, fieldName),
        }),
      {}
    );

    const SCALAR_OPERATORS = ["eq", "ne", "gt", "gte", "lt", "lte"];
    const OBJECT_OPERATORS = ["eq", "ne", "in", "ni"];

    Object.entries(this.ast.fields).forEach(([fieldName, field]) => {
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
          arg,
          resolver: (value, query) => {
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
    this.ast.filters = Object.entries(schemaFilters || {}).reduce<
      TAST["filters"]
    >((acc, [filterName, filter]) => {
      return Object.assign(acc, { [filterName]: Filter(filter) });
    }, {});

    return this;
  }

  hooks(schemaHooks: Schema["hooks"]) {
    this.ast.hooks = {
      preUpdate: schemaHooks.preUpdate || null,
    };

    return this;
  }

  query(schemaQuery: Schema["query"]) {
    this.ast.query = {
      one: schemaQuery.one || null,
      many: schemaQuery.many || null,
      default: schemaQuery.default || null,
    };

    return this;
  }

  typeDefs(schemaTypeDefs: Schema["typeDefs"]) {
    this.ast.typeDefs = schemaTypeDefs;

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
}

export default Model;
