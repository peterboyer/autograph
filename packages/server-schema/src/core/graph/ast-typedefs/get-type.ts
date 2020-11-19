import { TType } from "../../types/types-types";

export function getType(type: TType, partial = false) {
  if (partial) {
    // if partial remove non-null modifier from end
    return type.toString().replace(/!$/, "");
  }
  return type.toString();
}
