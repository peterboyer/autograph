import Knex from "knex";
import { partition } from "lodash";
import { TOptions } from "../schema-graph-types";
import TableInfo from "./table-info";
import Cursor, { ICursorOptions } from "./cursor";
import QueryConfig, { TQueryConfig } from "./query-config";

export type TNewCursorId = () => string;

const newCursorIdDefault: TNewCursorId = () =>
  Math.random().toString().substr(2);

export function QueryByArgs(
  knex: Knex,
  tableName: string,
  tableInfo: ReturnType<typeof TableInfo>,
  options?: {
    newCursorId?: TNewCursorId;
  }
): TOptions["queryById"] {
  const queryConfig = QueryConfig(knex);
  const newCursorId = options?.newCursorId || newCursorIdDefault;

  // * TODO: remove old cursors on cursor calls
  // * TODO: use redis to store cursor states to support multiple processes
  const cursors = new Map<string, ReturnType<typeof Cursor>>();

  return async (args, resolverArgs, getter) => {
    await tableInfo.resolve(tableName);
    const selectArgs = tableInfo.getSelectArgs(tableName);

    const typeToOperator = {
      eq: "=",
      ne: "!=",
      gt: ">",
      gte: ">=",
      lt: "<",
      lte: "<=",
    } as { [key: string]: string };

    const configAddFilters = (
      config: TQueryConfig,
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

        const config: TQueryConfig = {
          from: tableName,
          select: [],
          meta: {
            tableName,
            selectArgs,
          },
        };

        configAddFilters(config, filters);
        getter && getter(config)(...resolverArgs);

        // getting count should use specific select and remove all orders
        config.select = [(knex: Knex) => knex.raw("count(*)")];
        config.orders = [];

        return queryConfig.resolve(config).first();
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

        const config: TQueryConfig = {
          from: tableName,
          select: [`${tableName}.*`, ...selectArgs],
          limit: limit + 1,
          wheres: nextId
            ? [
                (query) =>
                  query.whereRaw(
                    `((${wheres.join(",")}) ${
                      orderBy === "asc" ? ">=" : "<="
                    } (${nextId.map((v) => `'${v}'`).join(",")}))`
                  ),
              ]
            : [],
          orders: orders,
          meta: {
            tableName,
            selectArgs,
          },
        };

        configAddFilters(config, filters);
        getter && getter(config)(...resolverArgs);

        return queryConfig.resolve(config);
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
}

export default QueryByArgs;
