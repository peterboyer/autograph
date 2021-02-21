import { Scalar } from "../types/type";
import { Types } from "../types/types";
import { asScalar, asList } from "../types/type-utils";
import { Field } from "./field";
import { Filter } from "./filter";

const SCALAR_OPERATORS = ["eq", "ne", "gt", "gte", "lt", "lte"];
const OBJECT_OPERATORS = ["eq", "ne", "in", "ni"];

export function useDefaultFilters(
  field: Field<any>,
  filters: Map<string, Filter>
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
    if (filters.has(name)) return;

    let type = asScalar(field.type);
    if (["in", "ni"].includes(operator)) {
      type = asList(type);
    }

    filters.set(name, {
      type,
      transport: "internal-query",
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
    });
  });
}
