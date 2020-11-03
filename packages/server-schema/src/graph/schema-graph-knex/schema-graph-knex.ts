import Knex from "knex";

import TableInfo, { ISelectMapType } from "./table-info";

import QueryById from "./knex-query-by-id";
import QueryByArgs, { TNewCursorId } from "./knex-query-by-args";
import QueryOnCreate from "./knex-query-on-create";
import QueryOnUpdate from "./knex-query-on-update";
import QueryOnDelete from "./knex-query-on-delete";

export default function KnexAdaptor(
  tableName: string,
  config: {
    knex: Knex;
    selectMap?: Record<any, ISelectMapType>;
    newCursorId?: TNewCursorId;
  }
) {
  const { knex } = config;
  const selectMap = new Map(Object.entries(config.selectMap || {}));
  const tableInfo = TableInfo(knex, selectMap);

  const queryById = QueryById(knex, tableName, tableInfo);
  const queryByArgs = QueryByArgs(knex, tableName, tableInfo, {
    newCursorId: config.newCursorId,
  });
  const queryOnCreate = QueryOnCreate(knex, tableName, tableInfo);
  const queryOnUpdate = QueryOnUpdate(knex, tableName, tableInfo);
  const queryOnDelete = QueryOnDelete(knex, tableName);

  return {
    queryById,
    queryByArgs,
    queryOnCreate,
    queryOnUpdate,
    queryOnDelete,
  };
}
