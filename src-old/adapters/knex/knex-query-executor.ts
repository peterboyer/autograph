import Knex from "knex";
import { QueryTransport } from "./transports";

export class KnexQueryExecutor {
  knex: Knex;

  constructor(knex: Knex) {
    this.knex = knex;
  }

  async execute<T extends Record<string, any>>(
    transport: QueryTransport
  ): Promise<T[]> {
    const query = this.knex.queryBuilder();
    transport.ops.forEach(({ func }) => func(query, this.knex));
    return await query;
  }
}
