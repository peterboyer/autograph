import TOptions from "./knex-options";
import TableInfo, {
  ISelectMapType,
} from "../../graph/schema-graph-knex/table-info";
import QueryParser from "../../graph/schema-graph-knex/query-config";

import QueryById from "./knex-query-by-id";
// import QueryByArgs, { TNewCursorId } from "./knex-query-by-args";
// import QueryOnCreate from "./knex-query-on-create";
// import QueryOnUpdate from "./knex-query-on-update";
// import QueryOnDelete from "./knex-query-on-delete";

export default function GraphKnex(options: {
  knex: TOptions["knex"];
  queryNameRemap?: Record<string, string>;
  querySelectRemap?: Record<string, ISelectMapType>;
}) {
  const { knex, queryNameRemap, querySelectRemap } = options;

  const _queryNameRemap = new Map(Object.entries(queryNameRemap || {}));
  const _querySelectRemap = new Map(Object.entries(querySelectRemap || {}));

  const _options = {
    knex,
    queryNameRemap: _queryNameRemap,
    querySelectRemap: _querySelectRemap,
    tableInfo: TableInfo(knex, _querySelectRemap),
    queryParser: QueryParser(knex),
  };

  const queryById = QueryById(_options);
  // const queryByArgs = QueryByArgs(knex, tableName, tableInfo, {
  //   newCursorId: config.newCursorId,
  // });
  // const queryOnCreate = QueryOnCreate(knex, tableName, tableInfo);
  // const queryOnUpdate = QueryOnUpdate(knex, tableName, tableInfo);
  // const queryOnDelete = QueryOnDelete(knex, tableName);

  return {
    queryById,
    // queryByArgs,
    // queryOnCreate,
    // queryOnUpdate,
    // queryOnDelete,
  };
}
