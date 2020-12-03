import { TQuery } from "../../../graph/ast-resolvers/ast-resolvers-options";

export interface Cursor {
  query: TQuery;
  total: number;
  index: any[];
}

export default Cursor;
