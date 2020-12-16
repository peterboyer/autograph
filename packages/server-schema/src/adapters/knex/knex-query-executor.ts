import Knex from "knex";

export type TKnexQuery = {
  from: string;
  limit?: number;
  selects?: (string | Knex.Raw)[];
  wheres?: any[][];
  orders?: { column: string; order: "asc" | "desc" }[];
  joins?: any[][];
  trx?: Knex.Transaction;
  count?: boolean;
};

class KnexQueryExecutor {
  knex: Knex;

  constructor(knex: Knex) {
    this.knex = knex;
  }

  async execute<T extends Record<string, any>>(
    query: TKnexQuery
  ): Promise<T[]> {
    const {
      trx,
      from,
      limit,
      selects,
      wheres,
      orders,
      joins,
      count = false,
    } = query;

    const exec = this.knex(from);

    // console.log("[debug.knex.query] has trx?", !!trx);
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

    if (count) {
      exec.clear("limit");
      exec.clear("select");
      exec.clear("order");
      exec.select([this.knex.raw("count(*)")]);
    }

    // console.log("[debug.knex.query]", exec.toSQL().toNative());

    return await exec;
  }
}

export default KnexQueryExecutor;
