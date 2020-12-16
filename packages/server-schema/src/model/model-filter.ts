import { TFilter } from "./model-types";
import { TFilter as TFilterAST } from "../types/types-ast";

export function Filter(modelFilter: TFilter) {
  // @ts-ignore
  const filter: TFilterAST = {};

  modelFilter({
    pre: (arg) => (transactor) =>
      Object.assign(filter, { stage: "pre", arg, transactor }),
    post: (arg) => (transactor) =>
      Object.assign(filter, { stage: "post", arg, transactor }),
  });

  return filter;
}

export default Filter;
