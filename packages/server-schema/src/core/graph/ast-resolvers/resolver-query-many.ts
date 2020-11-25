import { TAST } from "../../types/types-ast";
import { TResolver } from "../../types/types-graphql";
import TOptions, { TQuery } from "./ast-resolvers-options";

export function ResolverQueryMany(ast: TAST, options: TOptions) {
  return async (
    ...resolverArgs: Parameters<
      TResolver<
        undefined,
        {
          cursor?: string;
          order?: string;
          filters?: { [key: string]: any };
          limit?: number;
        }
      >
    >
  ) => {
    const { name } = ast;
    const [, args, context] = resolverArgs;

    const query_default: TQuery = {
      name,
      context,
    };

    const {
      limit: limitArg,
      cursor: cursorArg,
      order: orderArg,
      filters: filtersArg,
    } = args;

    if (cursorArg) {
      const query = { ...query_default, cursor: cursorArg };
      return await options.onQuery(query);
    }

    const query = {
      ...query_default,
      limit: Math.min(limitArg || ast.limitDefault, ast.limitMax),
    };

    if (!cursorArg && orderArg) {
      const [, orderFieldName, orderDirection] =
        orderArg.match(/^([\w\d]+)(?::(asc|desc))?$/) || [];
      if (!orderFieldName || !orderDirection)
        throw new Error("INVALID_QUERY_ORDER");

      const field = ast.fields[orderFieldName];
      if (!(field && field.orderTarget))
        throw new Error("INVALID_QUERY_ORDER_FIELD");

      query.order = {
        target: field.orderTarget,
        direction: orderDirection as "asc" | "desc",
      };
    }

    if (!cursorArg && filtersArg) {
      Object.entries(filtersArg).forEach(([filterName, value]) => {
        const filter = ast.filters[filterName];
        const _query = filter.resolver(query, value);
        if (_query) Object.assign(query, _query);
      });
    }

    const resolver = ast.query.many || ast.query.default;
    if (resolver) {
      const _query = await resolver(query, resolverArgs);
      if (_query) Object.assign(query, _query);
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
