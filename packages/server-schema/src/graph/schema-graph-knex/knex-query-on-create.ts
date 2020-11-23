// @ts-nocheck
import Knex from "knex";
import { TOptions } from "../schema-graph-types";
import TableInfo from "./table-info";
import QueryById from "../../core/graph-knex/knex-query-by-id";

export function QueryOnCreate(
  knex: Knex,
  tableName: string,
  tableInfo: ReturnType<typeof TableInfo>
): TOptions<number, Knex.Transaction>["queryOnCreate"] {
  const queryById = QueryById(knex, tableName, tableInfo);

  return async (transactors, resolverArgs, getter) => {
    let items: any[] = [];
    await knex.transaction(async (trx) => {
      items = await Promise.all<any>(
        transactors.map(async ({ pre, post }) => {
          const data = await pre(trx);

          const rows = await knex(tableName)
            .transacting(trx)
            .insert(data)
            .returning("id");

          const [id] = rows;
          await post(trx, id);

          return await queryById({ id: `${id}` }, resolverArgs, getter);
        })
      );
    });
    return items;
  };
}

export default QueryOnCreate;
