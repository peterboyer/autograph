import { TAST } from "../../types/types-ast";
import { TResolver } from "../../types/types-graphql";
import TOptions from "./ast-resolvers-options";

import ResolverRoot from "./resolver-root";
import ResolverQueryOne from "./resolver-query-one";
import ResolverQueryMany from "./resolver-query-many";
import ResolverMutation from "./resolver-mutation";

export default function Resolvers(ast: TAST, options: TOptions) {
  const { name } = ast;

  const { middleware } = options;
  const wrap = (resolver: TResolver): TResolver => {
    return async (...resolverArgs: Parameters<TResolver>) => {
      if (!middleware) return await resolver(...resolverArgs);
      return await middleware(resolverArgs, resolver);
    };
  };

  // you can't wrap a root/object resolver for a type
  // resolver.gets for fields shouldn't be transactional
  const Root = ResolverRoot(ast, options);

  const One = wrap(ResolverQueryOne(ast, options));
  const Many = wrap(ResolverQueryMany(ast, options));
  const Create = wrap(ResolverMutation(ast, options, "create"));
  const Update = wrap(ResolverMutation(ast, options, "update"));
  const Delete = wrap(ResolverMutation(ast, options, "delete"));

  const graphResolversRoot = {
    [`${name}`]: Root,
  };

  const graphResolversQuery = {
    [`${name}`]: One,
    [`${name}Many`]: Many,
  };

  const graphResolversMutation = {
    [`${name}Create`]: Create,
    [`${name}Update`]: Update,
    [`${name}Delete`]: Delete,
  };

  return {
    Root: graphResolversRoot,
    Query: graphResolversQuery,
    Mutation: graphResolversMutation,
  };
}
