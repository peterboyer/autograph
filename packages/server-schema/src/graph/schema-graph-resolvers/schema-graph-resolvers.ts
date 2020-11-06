import {
  types,
  TType,
  TFilter,
  TResolver,
  TSourceTree,
} from "../schema-graph-types";

import TResolverIOC from "./resolver-ioc";
import ResolverRoot from "./resolver-root";
import ResolverQueryOne from "./resolver-query-one";
import ResolverQueryMany from "./resolver-query-many";
import ResolverMutationCreate from "./resolver-mutation-create";
import ResolverMutationUpdate from "./resolver-mutation-update";
import ResolverMutationDelete from "./resolver-mutation-delete";

export default function Resolvers(tree: TSourceTree) {
  const { query, filters, limitDefault, limitMaxDefault } = tree;

  const queryOne = query?.one || query?.default;
  const queryMany = query?.many || query?.default;

  const _nodes = new Map(Object.entries(nodes));
  const _filters = new Map(Object.entries(filters || {}));

  const queryByIdOrThrow = async (..._args: Parameters<typeof queryById>) => {
    const result = await queryById(..._args);
    if (!result) {
      const [table, args, resolverArgs] = _args;
      throw errors.NotFound(table, args, resolverArgs);
    }
    return result;
  };

  const graphResolversRoot = {
    [`${name}`]: ResolverRoot(ioc)(_nodes),
  };

  const graphResolversQuery = {
    [`${name}`]: ResolverQueryOne(ioc)(queryOne),
    [`${name}_many`]: ResolverQueryMany(ioc)(_nodes, _filters, queryMany),
  };

  const graphResolversMutation = {
    [`${name}_create`]: ResolverMutationCreate(ioc)(_nodes),
    [`${name}_update`]: ResolverMutationUpdate(ioc)(_nodes),
    [`${name}_delete`]: ResolverMutationDelete(ioc)(_nodes),
  };

  return {
    Root: graphResolversRoot,
    Query: graphResolversQuery,
    Mutation: graphResolversMutation,
  };
}
