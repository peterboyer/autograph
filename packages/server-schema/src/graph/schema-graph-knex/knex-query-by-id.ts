import Knex from "knex";
import { TOptions } from "../schema-graph-types";
import TableInfo from "./table-info";
import QueryConfig, { TQueryConfig } from "./query-config";

export function QueryById(
  knex: Knex,
  tableName: string,
  tableInfo: ReturnType<typeof TableInfo>
): TOptions<number, Knex.Transaction>["queryById"] {
  const queryConfig = QueryConfig(knex);

  return async (args, resolverArgs, getter, trx) => {
    await tableInfo.resolve(tableName);
    const selectArgs = tableInfo.getSelectArgs(tableName);

    const { id } = args;

    const config: TQueryConfig = {
      from: tableName,
      select: [`${tableName}.*`, ...selectArgs],
      wheres: [[`${tableName}.id`, id]],
      meta: {
        tableName,
        selectArgs,
      },
    };

    const _trx = trx || (await knex.transaction());

    getter && getter(config, _trx)(...resolverArgs);

    return queryConfig.resolve(config, _trx).first();
  };
}

export default QueryById;
