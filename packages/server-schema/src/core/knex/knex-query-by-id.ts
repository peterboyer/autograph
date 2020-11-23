// @ts-nocheck
import TOptions from "./knex-options";
import TGraphOptions from "../graph/ast-resolvers/ast-resolvers-options";

import { TQueryConfig } from "../../graph/schema-graph-knex/query-config";

export function QueryById(options: TOptions): TGraphOptions["queryById"] {
  const { tableInfo, queryParser, queryNameRemap } = options;

  return async (name, id) => {
    const tableName = queryNameRemap?.get(name) || name;

    await tableInfo.resolve(tableName);
    const selectArgs = tableInfo.getSelectArgs(tableName);

    const config: TQueryConfig = {
      from: tableName,
      select: [`${tableName}.*`, ...selectArgs],
      wheres: [[`${tableName}.id`, id]],
      meta: {
        tableName,
        selectArgs,
      },
    };

    // const _trx = trx || (await knex.transaction());

    // getter && getter(config, _trx)(...resolverArgs);

    return queryParser.resolve(config).first();
  };
}

export default QueryById;
