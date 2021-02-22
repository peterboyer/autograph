import { Type } from "../../types/type";
import { getType } from "./get-type";

export function getTypeDictArgs(args: Record<string, Type>) {
  return Object.entries(args)
    .map(([key, type]) => `${key}: ${getType(type)}`)
    .join(" ");
}
