import { Type } from "../../types/type";

export function getType(type: Type, partial = false) {
  return `${type.isList ? `[${type.name}!]` : type.name}${
    !partial && type.isNonNull ? "!" : ""
  }`;
}
