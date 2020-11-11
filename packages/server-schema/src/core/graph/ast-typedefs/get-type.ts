import { TType } from "../../types/types-types";

export function getType(type: TType) {
  return type.array
    ? `[${type.name}!]${type.nullable ? "" : "!"}`
    : `${type.name}${type.nullable ? "" : "!"}`;
}
