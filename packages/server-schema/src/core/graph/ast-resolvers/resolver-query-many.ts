import { TAST } from "../../types/types-ast";
import { TResolver } from "../../types/types-graphql";
import TOptions, { TQuery } from "./ast-resolvers-options";

export function ResolverQueryMany(ast: TAST, options: TOptions) {
  return async (
    ...resolverArgs: Parameters<
      TResolver<
        never,
        {
          cursor?: string;
          order?: string;
          filters?: { [key: string]: any };
          limit?: number;
        }
      >
    >
  ) => {
    const [, args] = resolverArgs;

    const {
      limit: limitArg,
      cursor: cursorArg,
      order: orderArg,
      filters: filtersArg,
    } = args;

    const { name } = ast;
    const query: TQuery = {
      name,
      limit: Math.min(limitArg || ast.limitDefault, ast.limitMax),
      orders: [],
      filters: [],
    };

    if (cursorArg) {
      query.cursor = cursorArg;
    }

    if (!cursorArg && orderArg) {
      const [, orderFieldName, orderDirection] =
        orderArg.match(/^([\w\d]+)(?::(asc|desc))?$/) || [];
      if (!orderFieldName || !orderDirection)
        throw new Error("INVALID_QUERY_ORDER");

      const field = ast.fields[orderFieldName];
      if (!(field && field.orderTarget))
        throw new Error("INVALID_QUERY_ORDER_FIELD");

      query.orders.push({
        target: field.orderTarget,
        direction: orderDirection as "asc" | "desc",
      });
    }

    if (!cursorArg && filtersArg) {
      Object.entries(filtersArg).forEach(([filterName, value]) => {
        const filter = ast.filters[filterName];
        const _query = filter.resolver(query, value);
        if (_query) Object.assign(query, _query);
      });
    }

    const { items, total, cursor } = await options.onQuery(query);

    return {
      items: items,
      total: total,
      cursor: cursor,
    };
  };
}

export default ResolverQueryMany;
