import Knex from "knex";
import lodash from "lodash";

import {
  IQueryOnCreate,
  IQueryByArgs,
  IQueryOnUpdate,
  IQueryOnDelete,
  IQueryById,
} from "../SchemaGraphQL.types";
import Cursor, { ICursorOptions } from "./Cursor";
import TableInfo, { ISelectMapType } from "./TableInfo";
import QueryConfig, { IQueryConfig } from "./QueryConfig";

const { partition } = lodash;

type INewCursorId = () => string;

const newCursorIdDefault: INewCursorId = () =>
  Math.random().toString().substr(2);

export default function SchemaGraphQLKnex(config: {
  knex: Knex;
  selectMap?: Record<any, ISelectMapType>;
  newCursorId?: INewCursorId;
}) {
  const {
    knex,
    selectMap: _selectMap = {},
    newCursorId: _newCursorId,
  } = config;

  const selectMap = new Map(Object.entries(_selectMap));
  const newCursorId = _newCursorId || newCursorIdDefault;

  const {
    resolve: resolveTableInfo,
    getSelectArgs: getTableSelectArgs,
  } = TableInfo(knex, selectMap);

  const { resolve: queryFromConfig } = QueryConfig(knex);

  // TODO: remove old cursors on cursor calls
  // TODO: use redis to store cursor states to support multiple processes
  const cursors = new Map<string, ReturnType<typeof Cursor>>();

  const queryById: IQueryById = async (
    tableName,
    args,
    resolverArgs,
    getter,
    trx
  ) => {
    await resolveTableInfo(tableName);
    const selectArgs = getTableSelectArgs(tableName);

    const { id } = args;

    const config: IQueryConfig = {
      from: tableName,
      select: [`${tableName}.*`, ...selectArgs],
      wheres: [[`${tableName}.id`, id]],
    };
    getter && getter(config, { tableName, selectArgs })(...resolverArgs);

    return queryFromConfig(config, trx).first();
  };

  const queryByArgs: IQueryByArgs = async (
    tableName,
    args,
    resolverArgs,
    getter
  ) => {
    await resolveTableInfo(tableName);
    const selectArgs = getTableSelectArgs(tableName);

    const typeToOperator = {
      eq: "=",
      ne: "!=",
      gt: ">",
      gte: ">=",
      lt: "<",
      lte: "<=",
    } as { [key: string]: string };

    const configAddFilters = (
      config: IQueryConfig,
      filters: typeof args.filters
    ) => {
      const [generics, customs] = partition(
        filters,
        (filter) => !("_custom" in filter)
      );

      config.wheres = config.wheres || [];

      generics.forEach((filter) => {
        if ("_custom" in filter) return;
        const { name, type, value } = filter;
        config.wheres!.push([name, typeToOperator[type], value]);
      });

      customs.forEach((filter) => {
        if (!("_custom" in filter)) return;
        const {
          _custom: { use },
          value,
        } = filter;
        use(config, value);
      });
    };

    const cursorConfig: ICursorOptions = {
      tableName,
      order: args.order,
      filters: args.filters,
      limit: args.limit,
      getCountQuery: (options) => {
        const { filters } = options;

        const config: IQueryConfig = {
          from: tableName,
          select: [],
        };

        configAddFilters(config, filters);
        getter && getter(config, { tableName, selectArgs })(...resolverArgs);

        // getting count should use specific select and remove all orders
        config.select = [(knex: Knex) => knex.raw("count(*)")];
        config.orders = [];

        return queryFromConfig(config).first();
      },
      getCount: async (query) => {
        const info = await query;
        return parseInt(info?.count as string);
      },
      getPageQuery: (nextId, options) => {
        const { limit, order, filters } = options;

        const orderName = order?.name;
        const orderBy = order?.by || "asc";

        const wheres = [`"${tableName}"."id"`];
        orderName && wheres.unshift(`"${tableName}"."${orderName}"`);

        const orders = [[`${options.tableName}.id`, orderBy]];
        orderName &&
          orders.unshift([`${options.tableName}.${orderName}`, orderBy]);

        const config: IQueryConfig = {
          from: tableName,
          select: [`${tableName}.*`, ...selectArgs],
          limit: limit + 1,
          wheres: nextId
            ? [
                [],
                (query) =>
                  query.whereRaw(
                    `((${wheres.join(",")}) ${
                      orderBy === "asc" ? ">=" : "<="
                    } (${nextId.map((v) => `'${v}'`).join(",")}))`
                  ),
              ]
            : [],
          orders: orders,
        };

        configAddFilters(config, filters);
        getter && getter(config, { tableName, selectArgs })(...resolverArgs);

        return queryFromConfig(config);
      },
      getPage: async (query) => {
        return query;
      },
      resolveCursorOrderValue: (value) => {
        if (value instanceof Date) return value.toISOString();
        return value.toString();
      },
    };

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

  const queryOnCreate: IQueryOnCreate = async (
    tableName,
    transactors,
    resolverArgs,
    getter
  ) => {
    let items: any[] = [];
    await knex.transaction(async (trx) => {
      items = await Promise.all<any>(
        transactors.map(async ({ pre, post }) => {
          const [, data] = await pre(trx);

          const rows = await knex(tableName)
            .transacting(trx)
            .insert(data)
            .returning("id");

          const id = rows[0];
          await post(trx, id);

          return await queryById(
            tableName,
            { id: `${id}` },
            resolverArgs,
            getter,
            trx
          );
        })
      );
    });
    return items;
  };

  const queryOnUpdate: IQueryOnUpdate = async (
    tableName,
    transactors,
    resolverArgs,
    getter
  ) => {
    let items: any[] = [];
    await knex.transaction(async (trx) => {
      items = await Promise.all<any>(
        transactors.map(async ({ pre, post }) => {
          const [id, data] = await pre(trx);

          await knex(tableName)
            .transacting(trx)
            .where({ id })
            .update(data)
            .returning("id");

          await post(trx, id);

          return await queryById(
            tableName,
            { id: `${id}` },
            resolverArgs,
            getter,
            trx
          );
        })
      );
    });
    return items;
  };

  const queryOnDelete: IQueryOnDelete = async (tableName, ids) => {
    await knex.transaction(async (trx) => {
      await knex(tableName).transacting(trx).whereIn("id", ids).delete();
    });
    return ids;
  };

  return {
    queryById,
    queryByArgs,
    queryOnCreate,
    queryOnUpdate,
    queryOnDelete,
  };
}
