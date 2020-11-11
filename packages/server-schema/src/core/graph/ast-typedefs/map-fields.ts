import { TField } from "../../types/types-schema-ast";
import { getType } from "./get-type";
import { getTypeDictArgs } from "./get-type-dict-args";

export function mapFields(fields: Map<any, TField>) {
  const acc = new Set<string>();
  for (const [fieldName, field] of fields) {
    const resolverGet = field.resolver.get;
    if (!resolverGet) continue;

    const { args } = resolverGet;
    const fieldArgs = Object.keys(args).length
      ? `(${getTypeDictArgs(args)})`
      : "";
    const fieldType = getType(field.type);

    acc.add(`${fieldName}${fieldArgs}: ${fieldType}`);
  }
  return [...acc.values()].join("\n");
}
