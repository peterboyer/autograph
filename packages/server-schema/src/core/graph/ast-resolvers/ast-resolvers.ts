import { TAST } from "../../types/types-ast";
import TOptions from "./ast-resolvers-options";

import ResolverRoot from "./resolver-root";
import ResolverQueryOne from "./resolver-query-one";
import ResolverQueryMany from "./resolver-query-many";
import ResolverMutation from "./resolver-mutation";

export default function Resolvers(ast: TAST, options: TOptions) {
  const { name } = ast;

  const Root = ResolverRoot(ast, options);
  const One = ResolverQueryOne(ast, options);
  const Many = ResolverQueryMany(ast, options);
  const Create = ResolverMutation(ast, options, "create");
  const Update = ResolverMutation(ast, options, "update");
  const Delete = ResolverMutation(ast, options, "delete");

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
