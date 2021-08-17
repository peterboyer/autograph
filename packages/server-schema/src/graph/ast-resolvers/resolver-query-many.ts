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
      return await options.adapter.onQuery(query);
    }

    const query = {
      ...query_default,
      limit: Math.min(limitArg || ast.limitDefault, ast.limitMax),
    };

    if (orderArg) {
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

    if (filtersArg) {
      Object.entries(filtersArg).forEach(([filterName, value]) => {
        const filter = ast.filters[filterName];
        if (filter.stage !== "pre") return;
        filter.transactor(value, query, context);
      });
    }

    const queryResolver = ast.query.many || ast.query.default || undefined;
    const queryResolverWrapped = (query: Record<string, any>) => {
      if (filtersArg) {
        Object.entries(filtersArg).forEach(([filterName, value]) => {
          const filter = ast.filters[filterName];
          if (filter.stage !== "post") return;
          filter.transactor(value, query, context);
        });
      }
      queryResolver && queryResolver(query, context);
    };
    const { items, total, cursor } = await options.adapter.onQuery(
      query,
      queryResolverWrapped
    );

    return {
      items: items,
      total: total,
      cursor: cursor,
    };
  };
}

export default ResolverQueryMany;
