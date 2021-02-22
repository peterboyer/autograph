import { TQuery } from "../../../graph/resolvers-utils/ast-resolvers-options";

export interface Cursor {
  query: TQuery;
  total: number;
  index: any[];
}

export default Cursor;
