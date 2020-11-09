import { TType } from "../../types/types-types";
import { getType } from "./ast-get-type";

export function getTypeDictArgs(args: Record<any, TType>) {
  return Object.entries(args)
    .map(([key, type]) => `${key}: ${getType(type)}`)
    .join(" ");
}
