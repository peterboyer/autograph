import { TFilter } from "./model-types";
import { TFilter as TFilterAST } from "../types/types-ast";

export function Filter(filter: TFilter): TFilterAST {
  let obj: {
    current?: {
      arg: any;
      resolver: any;
    };
  } = {};
  filter({
    use: (arg) => (resolver) => {
      obj.current = {
        arg,
        resolver,
      };
    },
  });
  return obj.current!;
}

export default Filter;
