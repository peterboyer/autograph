import Knex from "knex";
import lodash from "lodash";

import { IQueryByArgs } from "../SchemaGraphQL.types";
const { pick } = lodash;

export type ICursorOptionsPicked = "tableName" | "limit" | "order" | "filters";

export type ICursorOptions = {
  tableName: string;
  limit: Parameters<IQueryByArgs>[1]["limit"];
  order?: Parameters<IQueryByArgs>[1]["order"];
  filters: Parameters<IQueryByArgs>[1]["filters"];
  getCountQuery: (
    options: Pick<ICursorOptions, ICursorOptionsPicked>
  ) => Knex.QueryBuilder;
  getCount: (query: Knex.QueryBuilder) => Promise<number>;
  getPageQuery: (
    nextId: any[] | null,
    options: Pick<ICursorOptions, ICursorOptionsPicked>
  ) => Knex.QueryBuilder;
  getPage: (query: Knex.QueryBuilder) => Promise<any>;
  resolveCursorOrderValue: (value: any) => string;
};

export async function* Cursor(options: ICursorOptions) {
  const queryOptions = pick(options, [
    "tableName",
    "limit",
    "order",
    "filters",
  ]);

  // don't mutate input query object
  const total = await options.getCount(options.getCountQuery(queryOptions));

  // active immediately false if no items
  let active = !!total;
  if (!active) return undefined;
  let nextId: any[] | null = null;

  while (true) {
    const rows: Record<any, any>[] = await options.getPage(
      options.getPageQuery(nextId, queryOptions)
    );

    const limitRow = rows.length === options.limit + 1 ? rows.pop() : undefined;
    const result = { items: rows, total };

    // if no limitRow for another page, finish generating
    if (!limitRow) {
      return result;
    }
    // set value of nextId to order.name's value
    const orderName = options.order?.name;
    nextId = [limitRow["id"]];
    orderName &&
      nextId.unshift(options.resolveCursorOrderValue(limitRow[orderName]));

    yield result;
  }
}

export default Cursor;
