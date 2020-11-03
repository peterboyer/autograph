import Knex from "knex";
import { TOptions } from "../schema-graph-types";
import TableInfo from "./table-info";
import QueryById from "./knex-query-by-id";

export function QueryOnUpdate(
  knex: Knex,
  tableName: string,
  tableInfo: ReturnType<typeof TableInfo>
): TOptions<number, Knex.Transaction>["queryOnUpdate"] {
  const queryById = QueryById(knex, tableName, tableInfo);

  return async (transactors, resolverArgs, getter) => {
    let items: any[] = [];

    const trx = await knex.transaction();

    await Promise.all<any>(
      transactors.map(async ({ pre, post }) => {
        const [id, data] = await pre(trx);

        await knex(tableName)
          .transacting(trx)
          .where({ id })
          .update(data)
          .returning("id");

        await post(trx, id);

        return await queryById({ id: `${id}` }, resolverArgs, getter, trx);
      })
    );
    return items;
  };
}

export default QueryOnUpdate;
