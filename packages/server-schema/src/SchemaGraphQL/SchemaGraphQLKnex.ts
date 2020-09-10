import {
  IQueryOnCreate,
  IQueryByArgs,
  IQueryOnUpdate,
  IQueryOnDelete,
  IQueryById,
} from "./SchemaGraphQL.types";
import Knex from "knex";
import lodash from "lodash";
const { pick } = lodash;

type TableInfo = {
  columns: Map<string, { type: string }>;
  selectArgs: Set<string>;
};

type QuerySelectMap = Record<any, (name: string, knex: any) => string>;

type INewCursorId = () => string;

const newCursorIdDefault: INewCursorId = () =>
  Math.random().toString().substr(2);

export type ICursorOptions = {
  tableName: string;
  limit: number;
  order?: { name: string; by?: string };
  filters: { name: string; type: string; value: any }[];
  getCountQuery: (
    options: Pick<ICursorOptions, "tableName" | "limit" | "order" | "filters">
  ) => Knex.QueryBuilder;
  getCount: (query: Knex.QueryBuilder) => Promise<number>;
  getPageQuery: (
    nextId: any[] | null,
    options: Pick<ICursorOptions, "tableName" | "limit" | "order" | "filters">
  ) => Knex.QueryBuilder;
  getPage: (query: Knex.QueryBuilder) => Promise<any>;
  resolveCursorOrderValue: (value: any) => string;
};

export default function SchemaGraphQLKnex(config: {
  knex: Knex;
  selectMap?: QuerySelectMap;
  newCursorId?: INewCursorId;
}) {
  const {
    knex,
    selectMap: _selectMap = {},
    newCursorId: _newCursorId,
  } = config;

  const selectMap = new Map(Object.entries(_selectMap));

  const newCursorId = _newCursorId || newCursorIdDefault;

  const tables = new Map<string, TableInfo>();

  async function resolveTableInfo(tableName: string) {
    if (!tables.has(tableName)) {
      const query = await knex.raw(
        `select * from information_schema.columns where table_name = '${tableName}'`
      );

      const columns = new Set<{ column_name: string; udt_name: string }>(
        query.rows
      );
      const tableColumns = new Map<string, { type: string }>();
      const tableSelectArgs = new Set<string>();

      columns.forEach(({ column_name: name, udt_name: type }) => {
        tableColumns.set(name, { type });
        if (selectMap.has(type)) {
          const selectMapType = selectMap.get(type);
          selectMapType && tableSelectArgs.add(selectMapType(name, knex));
        }
      });

      tables.set(tableName, {
        columns: tableColumns,
        selectArgs: tableSelectArgs,
      });
    }
  }

  function getTableSelectArgs(tableName: string) {
    return tables.get(tableName)?.selectArgs || new Set();
  }

  const queryById: IQueryById<Knex.QueryBuilder> = async (
    tableName,
    args,
    resolverArgs,
    getter
  ) => {
    await resolveTableInfo(tableName);
    const selectArgs = getTableSelectArgs(tableName);

    const { id } = args;
    const defaultQuery = knex(tableName)
      .select(`${tableName}.*`, ...selectArgs)
      .where(`${tableName}.id`, id)
      .first();

    const query =
      (getter &&
        getter(defaultQuery, { tableName, selectArgs })(...resolverArgs)) ||
      defaultQuery;

    return await query;
  };

  async function* Cursor(options: ICursorOptions) {
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

      const limitRow =
        rows.length === options.limit + 1 ? rows.pop() : undefined;
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

  const cursors = new Map<string, ReturnType<typeof Cursor>>();

  const queryByArgs: IQueryByArgs<ICursorOptions> = async (
    tableName,
    args,
    resolverArgs,
    getter
  ) => {
    await resolveTableInfo(tableName);
    const selectArgs = getTableSelectArgs(tableName);

    // type IWheres = [name: string, operator: string, value: any][];
    type IWheres = [string, string, any][];

    const resolveFilters = (filters: ICursorOptions["filters"]) => {
      const typeToOperator = {
        eq: "=",
        ne: "!=",
        gt: ">",
        gte: ">=",
        lt: "<",
        lte: "<=",
      } as { [key: string]: string };

      const wheres: IWheres = filters.map(({ name, type, value }) => [
        name,
        typeToOperator[type],
        value,
      ]);

      return wheres;
    };

    const cursorOptionsDefault: ICursorOptions = {
      tableName,
      order: args.order,
      filters: args.filters,
      limit: args.limit,
      getCountQuery: (options) => {
        const { filters } = options;
        return knex(tableName)
          .select(knex.raw("count(*)"))
          .where(function () {
            for (const filter of resolveFilters(filters)) {
              this.where(...filter);
            }
          })
          .first();
      },
      getCount: async (query) => {
        const info = await query;
        return parseInt(info?.count as string);
      },
      getPageQuery: (nextId, options) => {
        const { limit, order, filters } = options;

        const orderName = order?.name;
        const orderBy = order?.by || "asc";

        const orders = [[`${options.tableName}.id`, orderBy]];
        orderName &&
          orders.unshift([`${options.tableName}.${orderName}`, orderBy]);

        const wheres = [`"${tableName}"."id"`];
        orderName && wheres.unshift(`"${tableName}"."${orderName}"`);

        return knex(tableName)
          .select(`${tableName}.*`, ...selectArgs)
          .limit(limit + 1)
          .where(function () {
            nextId &&
              this.whereRaw(
                `((${wheres.join(",")}) ${
                  orderBy === "asc" ? ">=" : "<="
                } (${nextId.map((v) => `'${v}'`).join(",")}))`
              );
          })
          .orderBy(orders.map(([column, order]) => ({ column, order })))
          .where(function () {
            for (const filter of resolveFilters(filters)) {
              this.where(...filter);
            }
          });
      },
      getPage: async (query) => {
        return query;
      },
      resolveCursorOrderValue: (value) => {
        if (value instanceof Date) return value.toISOString();
        return value.toString();
      },
    };

    const cursorConfig =
      (getter &&
        getter(cursorOptionsDefault, { tableName, selectArgs })(
          ...resolverArgs
        )) ||
      cursorOptionsDefault;

    let cursorId = args?.cursor;
    let cursor: ReturnType<typeof Cursor> | undefined = undefined;

    if (cursorId) {
      const _cursor = cursors.get(cursorId);
      if (_cursor) {
        cursor = _cursor;
      }
    }

    if (!cursor) {
      cursorId = newCursorId();
      cursor = Cursor(cursorConfig);
      cursors.set(cursorId, cursor);
    }

    const { value, done } = await cursor.next();

    return {
      items: value?.items || [],
      total: value?.total || 0,
      cursor: done ? undefined : cursorId,
    };
  };

  const queryOnCreate: IQueryOnCreate = async () => {
    // ! TODO: use update SETTER data resolution logic
    // TODO: implement bulk creation function
    return [];
  };

  const queryOnUpdate: IQueryOnUpdate = async (
    tableName,
    transactors,
    resolverArgs
  ) => {
    let items: any[] = [];
    await knex.transaction(async (trx) => {
      items = await Promise.all<any>(
        transactors.map(async (transactor) => {
          const [id, data] = await transactor(trx);
          await knex(tableName).transacting(trx).where({ id }).update(data);
          // TODO: optimise, avoid second query?
          return queryById(tableName, id, resolverArgs);
        })
      );
    });
    return items;
  };

  const queryOnDelete: IQueryOnDelete = async (tableName, ids) => {
    return [];
  };

  return {
    queryById,
    queryByArgs,
    queryOnCreate,
    queryOnUpdate,
    queryOnDelete,
  };
}
