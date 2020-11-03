import { TFilter, TNode, TQuerier, TResolver } from "../schema-graph-types";
import TResolverIOC from "./resolver-ioc";

const getNodeScalarAlias = (node: TNode) =>
  node.type.__is !== "scalar"
    ? undefined
    : typeof node.resolver === "string"
    ? node.resolver
    : typeof node.resolver?.get === "string"
    ? node.resolver?.get
    : undefined;

export function ResolverQueryMany(ioc: TResolverIOC) {
  return function (
    nodes: Map<string, TNode>,
    filters: Map<string, TFilter>,
    querier?: TQuerier
  ): TResolver<
    undefined,
    {
      cursor?: string;
      order?: string;
      filters?: { [key: string]: any };
      limit?: number;
    }
  > {
    return async (...resolverArgs) => {
      const [, args] = resolverArgs;
      const {
        cursor,
        order: orderArg,
        limit: limitArg,
        filters: filtersArg,
      } = args;
      const [, orderNodeName, orderDirection] =
        (orderArg && orderArg.match(/^([\w\d]+)(?::(asc|desc))?$/)) || [];

      // resolve view to data layer node name resolutions for queries
      const orderNode = nodes.get(orderNodeName);
      if (orderNodeName) {
        // if node exists
        // AND node type is scalar (complex is not orderable)
        // AND node resolver is a "string" or NOT a function (no derived props,
        // only aliases allowed)
        // THEN it is a valid order key
        if (!(orderNode && getNodeScalarAlias(orderNode)))
          throw new Error("INVALID_QUERY_ORDER_KEY");
      }

      // the name of the column, and if resolver is aliased to it
      const orderNodeSourceName = orderNode && getNodeScalarAlias(orderNode);

      const order =
        (orderNodeSourceName && {
          name: orderNodeSourceName,
          by: orderDirection,
        }) ||
        undefined;

      const _filters = filtersArg
        ? Object.entries(filtersArg).map(([identifier, value]) => {
            const filter = filters.get(identifier);
            if (filter) {
              return { _custom: filter, value };
            }
            const [, key, type] = identifier.match(/^([\w]+)(?:_(\w+)$)/) || [];
            const node = nodes.get(key)!;
            const nodeSourceName = getNodeScalarAlias(node);
            return { name: nodeSourceName, type, value };
          })
        : [];

      // limit clamped by max
      const limit = Math.min(limitArg || ioc.limitDefault, ioc.limitMaxDefault);

      return ioc.queryByArgs(
        { cursor, order, filters: _filters, limit },
        resolverArgs,
        querier
      );
    };
  };
}
