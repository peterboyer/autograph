import Knex from "knex";
import TableInfo, {
  ISelectMapType,
} from "../../graph/schema-graph-knex/table-info";
import QueryParser from "../../graph/schema-graph-knex/query-config";

export type TOptions = {
  knex: Knex;
  queryNameRemap: Map<string, string>;
  querySelectRemap: Map<string, ISelectMapType>;
  tableInfo: ReturnType<typeof TableInfo>;
  queryParser: ReturnType<typeof QueryParser>;
};

export default TOptions;
