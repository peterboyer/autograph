import Knex from "knex";

export type IQueryConfig = {
  from: string;
  select: (string | ((knex: Knex) => any))[];
  limit?: number;
  wheres?: (
    | object
    | [string, string]
    | [string, string, string]
    | ((query: Knex.QueryBuilder) => void)
  )[];
  orders?: string[][];
  joins?: (string[] | ((query: Knex.QueryBuilder) => void))[];
};

export function QueryConfig(knex: Knex) {
  const resolve = (config: IQueryConfig, trx?: Knex.Transaction) => {
    const { from, select, limit, wheres, orders, joins } = config;

    const query = knex(from).select(
      ...select.map((value) => {
        if (typeof value === "function") {
          return value(knex);
        } else {
          return value;
        }
      })
    );

    if (trx) query.transacting(trx);

    if (limit) query.limit(limit);

    if (wheres)
      query.where(function () {
        wheres.forEach((condition) => {
          if (typeof condition === "function") {
            // callback with query as this
            condition(this);
          } else if (
            Array.isArray(condition) &&
            (condition.length === 2 || condition.length === 3)
          ) {
            // array of args spread for where
            // @ts-ignore: knex overloads not allowing spread args
            this.where(...condition);
          } else if (
            condition &&
            !Array.isArray(condition) &&
            typeof condition === "object"
          ) {
            // object for where
            this.where(condition);
          } else {
            // invalid where type
            throw new TypeError(
              `'wheres' condition ([${condition.toString()}])` +
                " must be either a function, an array of length 2 or 3," +
                " or an object"
            );
          }
        });
      });

    if (orders) {
      query.orderBy(orders.map(([column, order]) => ({ column, order })));
    }

    if (joins) {
      joins.forEach((condition) => {
        if (typeof condition === "function") {
          condition(query);
        } else {
          // @ts-ignore: knex overloads not allowing spread args
          query.join(...condition);
        }
      });
    }

    return query;
  };

  return {
    resolve,
  };
}

export default QueryConfig;
