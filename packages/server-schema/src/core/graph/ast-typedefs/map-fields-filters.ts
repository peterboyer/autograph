import { TFilter } from "../../types/types-ast";
import { getType } from "./get-type";

export function mapFieldsFilters(filters: Map<any, TFilter>) {
  const acc = new Set<string>();

  for (const [filterName, filter] of filters) {
    acc.add(`${filterName}: ${getType(filter.arg, true)}`);
  }

  return [...acc.values()].join("\n");
}
