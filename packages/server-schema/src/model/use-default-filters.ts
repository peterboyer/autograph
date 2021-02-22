import { asScalar, asList } from "../types/type-utils";
import { Field } from "./field";
import { Filter, FilterResolver } from "./filter";

const SCALAR_OPERATORS = ["eq", "ne", "gt", "gte", "lt", "lte"];
const OBJECT_OPERATORS = ["eq", "ne", "in", "ni"];

export function useDefaultFilters(
  field: Field<any>,
  filters: Partial<Record<string, Filter>>
) {
  const target = field.filterTarget;
  if (!target) return;

  const operators =
    field.type._is === "scalar"
      ? SCALAR_OPERATORS
      : field.type._is === "object"
      ? OBJECT_OPERATORS
      : [];

  operators.forEach((operator) => {
    const name = `${field.name}_${operator}`;

    // skip if already defined
    if (filters[name]) return;

    let type = asScalar(field.type);
    if (["in", "ni"].includes(operator)) {
      type = asList(type);
    }

    const resolver: FilterResolver<typeof type, "internal"> = (
      value,
      query
    ) => {
      if (!("id" in query || "cursor" in query)) {
        query.filters = query.filters || [];
        query.filters.push({
          target,
          operator,
          value,
        });
      }
      return query;
    };

    filters[name] = {
      name,
      type,
      transport: "internal",
      resolver,
    };
  });
}
