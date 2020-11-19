import { TField, TFilter } from "../../types/types-ast";
import { getType } from "./get-type";

export function mapFieldsFilters(
  fields: Map<any, TField>,
  filters: Map<any, TFilter>
) {
  const acc = new Set<string>();
  for (const [fieldName, field] of fields) {
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
