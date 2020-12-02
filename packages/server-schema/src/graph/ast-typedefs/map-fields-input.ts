import { TField } from "../../types/types-ast";
import { getType } from "./get-type";

export function mapFieldsInput(fields: Map<any, TField>, partial = false) {
  const acc = new Set<string>();
  for (const [fieldName, field] of fields) {
    if (fieldName === "id") continue;

    const resolverSet = field.resolver.set;
    if (!resolverSet) continue;
    if (!resolverSet.arg) continue;

    const { arg } = resolverSet;
    const fieldArg = getType(arg, partial);

    acc.add(`${fieldName}: ${fieldArg}`);
  }
  return [...acc.values()].join("\n");
}
