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
      cursor: cursorArg,
      order: orderArg,
      limit: limitArg,
      filters: filtersArg,
    } = args;

    const { name } = ast;
    const query: TQuery = {
      name,
      limit: Math.min(limitArg || ast.limitDefault, ast.limitMax),
    };

    if (cursorArg) {
      query.cursor = cursorArg;
    }

    if (orderArg) {
      const [, orderFieldName, orderDirection] =
        orderArg.match(/^([\w\d]+)(?::(asc|desc))?$/) || [];
      if (!orderFieldName || !orderDirection)
        throw new Error("INVALID_QUERY_ORDER");

      const field = ast.fields[orderFieldName];
      if (!(field && field.order)) throw new Error("INVALID_QUERY_ORDER_FIELD");

      query.order = {
        target: field.order,
        direction: orderDirection as "asc" | "desc",
      };
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
