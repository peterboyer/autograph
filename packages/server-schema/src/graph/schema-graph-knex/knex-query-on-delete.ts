// @ts-nocheck
import Knex from "knex";
import { TOptions } from "../schema-graph-types";

export function QueryOnDelete(
  knex: Knex,
  tableName: string
): TOptions<number, Knex.Transaction>["queryOnDelete"] {
  return async (ids) => {
    await knex.transaction(async (trx) => {
      await knex(tableName).transacting(trx).whereIn("id", ids).delete();
    });
    return ids;
  };
}

export default QueryOnDelete;
