import Knex from "knex";

export type TKnexQuery = {
  from: string;
  limit?: number;
  selects?: (string | Knex.Raw)[];
  wheres?: any[][];
  orders?: { column: string; order: "asc" | "desc" }[];
  joins?: any[][];
  trx?: Knex.Transaction;
};

class KnexQueryExecutor {
  knex: Knex;

  constructor(knex: Knex) {
    this.knex = knex;
  }

  async execute<T extends Record<string, any>>(
    query: TKnexQuery
  ): Promise<T[]> {
    const { trx, from, limit, selects, wheres, orders, joins } = query;

    const exec = this.knex(from);

    if (trx) exec.transacting(trx);

    if (limit) exec.limit(limit);

    if (selects) exec.select(selects);

    if (wheres)
      wheres.forEach((whereArgs) => {
        // @ts-ignore
        exec.where(...whereArgs);
      });

    if (orders) exec.orderBy(orders);

    if (joins)
      joins.forEach((joinArgs) => {
        // @ts-ignore
        exec.join(...joinArgs);
      });

    console.log("[debug.knex.query]", exec.toSQL().toNative());

    return await exec;
  }
}

export default KnexQueryExecutor;
