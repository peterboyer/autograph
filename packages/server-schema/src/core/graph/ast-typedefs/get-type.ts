import { TType } from "../../types/types-types";

export function getType(type: TType, partial = false) {
  return `${type.isList ? `[${type.name}!]` : type.name}${
    !partial && type.isNonNull ? "!" : ""
  }`;
}
