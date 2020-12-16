import Knex from "knex";
import { TQuery } from "../../graph/ast-resolvers/ast-resolvers-options";
import { TOnQueryOptions } from "./on-query";
import KnexQueryExecutor, { TKnexQuery } from "./knex-query-executor";
import identity from "lodash.identity";
import cloneDeep from "lodash.clonedeep";

export type TKnexQueryOptions = {
  knex: Knex;
  tableNames?: Map<string, string>;
  indexSerialiser?: (value: any) => any;
};

const FILTER_OPERATOR_MAP = new Map([
  ["eq", "="],
  ["ne", "!="],
  ["gt", ">"],
  ["gte", ">="],
  ["lt", "<"],
  ["lte", "<="],
]);

const indexSerialiser_default: TKnexQueryOptions["indexSerialiser"] = (
  value
) => {
  if (value instanceof Date) return value.toISOString();
  return value.toString();
};

const constructor = ({
  knex,
  tableNames: _tableNames,
  indexSerialiser: _indexSerialiser,
}: TKnexQueryOptions) => {
  const tableNames = _tableNames || new Map<string, string>();
  const indexSerialiser = _indexSerialiser || indexSerialiser_default;
  const knexQueryExecutor = new KnexQueryExecutor(knex);

  const useQuery: TOnQueryOptions["useQuery"] = async (
    graphQuery: TQuery<{ trx?: Knex.Transaction }>,
    { index, queryResolver } = {}
  ) => {
    /**
     * queryResolver wrapper to mutate graphQuery
     */
    const useQueryResolver = async (query: TKnexQuery) => {
      if (queryResolver) {
        const result = await queryResolver(query);
        if (result) Object.assign(query, result);
      }
    };

    /**
     * [endpoint]
     * graphQuery with cursor --- not supported
     */
    if (graphQuery.cursor) throw new Error("USE_QUERY_CURSOR_UNSUPPORTED");

    /**
     * [knex]
     * from <- name
     * trx <- graph.context.trx
     */
    const { name: queryName } = graphQuery;
    const from = tableNames.get(queryName) || queryName;
    const trx = graphQuery.context?.trx;

    const dataQuery: TKnexQuery = {
      from,
      trx,
    };

    /**
     * [knex]
     * joins <- knex.joins
     */
    dataQuery.joins = [];

    /**
     * [endpoint]
     * graphQuery with id
     */
    if (graphQuery.id) {
      const { id } = graphQuery;

      dataQuery.selects = [`${from}.*`];
      dataQuery.wheres = [[`${from}.id`, "=", id]];

      await useQueryResolver(dataQuery);
      const items = await knexQueryExecutor.execute(dataQuery);
      return { items, total: items.length };
    }

    /**
     * catch when id comes from a resolved value which is null
     * whereas if id is undefined, we continue as a "many" query
     */
    if (graphQuery.id === null) {
      return { items: [], total: 0 };
    }

    /**
     * [knex]
     * wheres <- filters
     * apply filters first, will affect count and normal fetches
     */
    const { filters: queryFilters = [] } = graphQuery;
    dataQuery.wheres = queryFilters.map((filter) => {
      const { target, operator: _operator, value } = filter;
      const operator = FILTER_OPERATOR_MAP.get(_operator) || _operator;
      return [`${from}.${target}`, operator, value];
    });

    /**
     * [result]
     * total
     * if index is provided, a cursor is being used, thus total already fetched
     */
    const total = await (async function () {
      if (index !== undefined) return -1;

      const countQuery = cloneDeep(dataQuery);
      countQuery.selects = [knex.raw("count(*)")];

      await useQueryResolver(countQuery);
      const [row] = await knexQueryExecutor.execute<{ count: string }>(
        countQuery
      );
      return parseInt(row.count);
    })();

    /**
     * [knex]
     * if index given, create a complex where statement using
     *   id => index[0] --- if query order not given (default sort by id)
     *   order,id => index[0],index[1] --- if query order given
     * order must be before id to prioritise it
     */
    const { order: queryOrder } = graphQuery;
    if (index) {
      const targets = [
        queryOrder && `"${from}"."${queryOrder.target}"`,
        `"${from}"."id"`,
      ].filter(identity);
      const direction = queryOrder?.direction || "asc";
      const values = index.filter(identity);

      const $targets = targets.map((v) => `${v}`).join(",");
      const $operator = direction === "asc" ? ">=" : "<=";
      const $values = values.map((v) => `'${v}'`).join(",");

      dataQuery.wheres.push([
        knex.raw(`((${$targets}) ${$operator} (${$values}))`),
      ]);
    }

    /**
     * [knex]
     * selects <- knex.selects
     */
    dataQuery.selects = [`${from}.*`];

    /**
     * [knex]
     * orders <- order
     */
    dataQuery.orders = [{ column: `${from}.id`, order: "asc" }];
    if (queryOrder)
      dataQuery.orders.unshift({
        column: `${from}.${queryOrder.target}`,
        order: queryOrder.direction,
      });

    /**
     * [knex]
     * limit <- limit
     * add 1 to limit, so that if n+1 item fetched, index will be returned
     */
    const { limit: queryLimit } = graphQuery;
    if (queryLimit === undefined) throw new Error("USE_QUERY_LIMIT_REQUIRED");
    dataQuery.limit = queryLimit + 1;

    /**
     * [result]
     * items
     */
    await useQueryResolver(dataQuery);
    const items = await knexQueryExecutor.execute<any>(dataQuery);

    /**
     * [result]
     * index
     */
    const nextItem = items.length === dataQuery.limit ? items.pop() : undefined;
    const nextIndex =
      nextItem &&
      [
        queryOrder && indexSerialiser(nextItem[queryOrder.target]),
        indexSerialiser(nextItem["id"]),
      ].filter(identity);

    return { items, total, index: nextIndex };
  };

  return useQuery;
};

export default constructor;
