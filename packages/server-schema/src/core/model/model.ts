import { TAST } from "../types/types-ast";
import { TScalar, Types } from "../types/types-types";
import { TModel, TArgs } from "./model-types";
import Field from "./model-field";
import Filter from "./model-filter";

/**
 * Parses a source object into a source tree object for compilation.
 * TSource describes your object as returned from a data source.
 * TArgs describes other parts:
 *   - Context, which describes the graph context
 *   - QueryConfig, which ?
 */
export function Model<
  Source extends {},
  Config extends { Context: unknown },
  ARGS extends TArgs = { Source: Source; Context: Config["Context"] },
  MODEL extends TModel<ARGS> = TModel<ARGS>
>(model: MODEL) {
  const { name } = model;

  const fields = Object.entries(model.fields).reduce<TAST["fields"]>(
    (acc, [fieldName, field]) =>
      Object.assign(acc, {
        [fieldName]: Field(field, fieldName),
      }),
    {}
  );

  const access: TAST["access"] = {
    create: model.access?.create || null,
    read: model.access?.read || null,
    update: model.access?.update || null,
    delete: model.access?.delete || null,
    default: model.access?.default || null,
  };

  const filters = Object.entries(model.filters || {}).reduce<TAST["filters"]>(
    (acc, [filterName, filter]) => {
      return Object.assign(acc, { [filterName]: Filter(filter) });
    },
    {}
  );

  // add default filters
  const SCALAR_OPERATORS = ["eq", "ne", "gt", "gte", "lt", "lte"];
  const OBJECT_OPERATORS = ["eq", "ne", "in", "ni"];

  Object.entries(fields).forEach(([fieldName, field]) => {
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
      if (filters[filterName]) return;

      const arg = (field.type._is === "scalar"
        ? field.type
        : Types.ID) as TScalar;

      if (["in", "ni"].includes(operator)) {
        arg.isList = true;
      }

      filters[filterName] = {
        arg,
        resolver: (query, value) => {
          query.filters.push({
            target,
            operator,
            value,
          });
          return query;
        },
      };
    });
  });

  const query: TAST["query"] = {
    one: model.query?.one || null,
    many: model.query?.many || null,
    default: model.query?.default || null,
  };

  const typeDefs: TAST["typeDefs"] = model.typeDefs || {};
  const limitDefault = model.limitDefault || 20;
  const limitMax = model.limitMax || 50;

  const ast = {
    name,
    fields,
    access,
    filters,
    query,
    typeDefs,
    limitDefault,
    limitMax,
  };

  return ast;
}

export default Model;
