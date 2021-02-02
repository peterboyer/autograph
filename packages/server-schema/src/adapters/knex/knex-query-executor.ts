import Knex from "knex";

type Op = {
  tag?: string;
  func: (query: Knex.QueryBuilder, knex: Knex) => void;
};

export const op = (func: Op["func"], tag?: Op["tag"]): Op => ({
  tag,
  func,
});

export type QueryMessage = {
  table: string;
  ops: Op[];
};

class KnexQueryExecutor {
  knex: Knex;

  constructor(knex: Knex) {
    this.knex = knex;
  }

  async execute<T extends Record<string, any>>(
    message: QueryMessage
  ): Promise<T[]> {
    const query = this.knex.queryBuilder();
    message.ops.forEach(({ func }) => func(query, this.knex));
    return await query;
  }
}

export default KnexQueryExecutor;
