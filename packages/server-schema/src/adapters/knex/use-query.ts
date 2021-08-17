import Knex from "knex";
import { TQuery } from "../../graph/ast-resolvers/ast-resolvers-options";
import { TOnQueryOptions } from "./on-query";
import KnexQueryExecutor, { QueryMessage, op } from "./knex-query-executor";
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
    { index: indexes, queryResolver } = {}
  ) => {
    /**
     * queryResolver wrapper to mutate graphQuery
     */
    const useQueryResolver = (query: QueryMessage) => {
      queryResolver && queryResolver(query);
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
    const table = tableNames.get(queryName) || queryName;
    const trx = graphQuery.context?.trx;

    const ops: QueryMessage["ops"] = [];
    const queryMessage: QueryMessage = { table, ops };

    ops.push(op((query) => query.from(table), "from"));
    if (trx) ops.push(op((query) => query.transacting(trx), "trx"));

    /**
     * [endpoint]
     * graphQuery with id
     */
    if (graphQuery.id) {
      const { id } = graphQuery;

      ops.push(op((query) => query.select(`${table}.*`), "select"));
      ops.push(op((query) => query.where(`${table}.id`, "=", id), "where"));

      useQueryResolver(queryMessage);
      const items = await knexQueryExecutor.execute(queryMessage);
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
    queryFilters.forEach((filter) => {
      const { target, operator: _operator, value } = filter;
      const operator = FILTER_OPERATOR_MAP.get(_operator) || _operator;
      ops.push(
        op(
          (query) => query.where(`${table}.${target}`, operator, value),
          `where-${target}-${_operator}`
        )
      );
    });

    /**
     * [result]
     * total
     * if index is provided, a cursor is being used, thus total already fetched
     */
    const total = await (async function () {
      if (indexes !== undefined) return -1;

      const countMessage = cloneDeep(queryMessage);
      countMessage.ops.filter(({ tag }) => tag !== "trx");
      countMessage.ops.push(
        op(
          (query, knex) =>
            query
              .clear("select")
              .clear("limit")
              .clear("order")
              .select(knex.raw("count(*)")),
          "count"
        )
      );
      useQueryResolver(countMessage);
      const [row] = await knexQueryExecutor.execute<{ count: string }>(
        countMessage
      );
      return row ? parseInt(row.count) : 0;
    })();

    /**
     * [knex]
     * if indexes given, create a complex where statement using
     *   id => indexes[0] --- if query order not given (default sort by id)
     *   order,id => indexes[0],indexes[1] --- if query order given
     * order must be before id to prioritise it
     */
    const { order: queryOrder } = graphQuery;
    if (indexes) {
      const targets = [
        queryOrder && `"${table}"."${queryOrder.target}"`,
        `"${table}"."id"`,
      ].filter(identity);
      const direction = queryOrder?.direction || "asc";
      const values = indexes.filter(identity);

      const $targets = targets.map((v) => `${v}`).join(",");
      const $operator = direction === "asc" ? ">=" : "<=";
      const $values = values.map((v) => `'${v}'`).join(",");

      ops.push(
        op(
          (query, knex) =>
            query.where(knex.raw(`((${$targets}) ${$operator} (${$values}))`)),
          "where"
        )
      );
    }

    /**
     * selects
     */
    ops.push(op((query) => query.select(`${table}.*`), "select"));

    /**
     * order
     */
    const orders = [
      { column: `${table}.id`, order: queryOrder?.direction || "asc" },
    ];
    if (queryOrder)
      orders.unshift({
        column: `${table}.${queryOrder.target}`,
        order: queryOrder.direction,
      });
    ops.push(op((query) => query.orderBy(orders), "order"));

    /**
     * limit
     */
    const { limit: queryLimit } = graphQuery;
    if (queryLimit === undefined) throw new Error("USE_QUERY_LIMIT_REQUIRED");
    const limit = queryLimit + 1;
    ops.push(op((query) => query.limit(limit), "limit"));

    /**
     * [result]
     * items
     */
    useQueryResolver(queryMessage);
    const items = await knexQueryExecutor.execute<any>(queryMessage);

    /**
     * [result]
     * index
     */
    const nextItem = items.length === limit ? items.pop() : undefined;
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
