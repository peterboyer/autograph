import {
  IQueryOnCreate,
  IQueryByArgs,
  IQueryOnUpdate,
  IQueryOnDelete,
  IQueryById,
} from "./SchemaGraphQL.types";
import Knex from "knex";

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
  order?: { name: string; by?: string };
  getCountQuery: () => Knex.QueryBuilder;
  getCount: (query: Knex.QueryBuilder) => Promise<number>;
  getPageQuery: (
    nextId: number | null,
    orders: { column: string; order: string }[],
    limit: number
  ) => Knex.QueryBuilder;
  getPage: (query: Knex.QueryBuilder) => Promise<any>;
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

  const queryById: IQueryById = async (tableName, id) => {
    await resolveTableInfo(tableName);
    const selectArgs = getTableSelectArgs(tableName);
    const query = knex(tableName)
      .select("*", ...selectArgs)
      .where({ id })
      .first();
    return [query, selectArgs];
  };

  async function* Cursor(options: ICursorOptions) {
    // don't mutate input query object
    const total = await options.getCount(options.getCountQuery());

    // active immediately false if no items
    let active = !!total;
    if (!active) return undefined;

    // TODO: specify limit from args, and clamp to max 20 items per page/limit
    let limit = 3;

    const order = options.order;
    const orderName = order && order.name;
    const orderBy = (order && order.by) || "asc";

    let nextId: number | null = null;

    const orders = [];
    orders.push({ column: `${options.tableName}.id`, order: orderBy });
    orderName &&
      orders.push({
        column: `${options.tableName}.${orderName}`,
        order: orderBy,
      });

    while (true) {
      const rows: Record<any, any>[] = await options.getPage(
        options.getPageQuery(nextId, orders, limit)
      );

      const limitRow = rows.length === limit + 1 ? rows.pop() : undefined;
      const result = { items: rows, total };

      // if no limitRow for another page, finish generating
      if (!limitRow) {
        return result;
      }
      // set value of nextId to order.name's value
      nextId = limitRow["id"];
      if (!nextId) {
        return result;
      }

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

    const cursorOptionsDefault: ICursorOptions = {
      tableName,
      order: args.order,
      getCountQuery: () => {
        return knex(tableName).select(knex.raw("count(*)")).first();
      },
      getCount: async (query) => {
        const info = await query;
        return parseInt(info?.count as string);
      },
      getPageQuery: (nextId, orders, limit) => {
        return knex(tableName)
          .select("*", ...selectArgs)
          .limit(limit + 1)
          .where(function () {
            nextId && this.where("id", ">=", nextId);
          })
          .orderBy(orders);
      },
      getPage: async (query) => {
        return query;
      },
    };

    const cursorConfig =
      (getter &&
        getter(tableName, selectArgs, cursorOptionsDefault)(...resolverArgs)) ||
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
      total: value?.total,
      cursor: done ? undefined : cursorId,
    };
  };

  const queryOnCreate: IQueryOnCreate = async () => {
    // ! TODO: use update SETTER data resolution logic
    // TODO: implement bulk creation function
    return [];
  };

  const queryOnUpdate: IQueryOnUpdate = async (tableName, transactors) => {
    let items: any[] = [];
    await knex.transaction(async (trx) => {
      items = await Promise.all<any>(
        transactors.map(async (transactor) => {
          const [id, data] = await transactor(trx);
          await knex(tableName).transacting(trx).where({ id }).update(data);
          // TODO: optimise, avoid second query?
          return queryById(tableName, id);
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
