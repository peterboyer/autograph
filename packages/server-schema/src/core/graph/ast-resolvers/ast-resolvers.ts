import { TAST } from "../../types/types-ast";
import TOptions from "./ast-resolvers-options";

import ResolverRoot from "./resolver-root";
import ResolverQueryOne from "./resolver-query-one";
import ResolverQueryMany from "./resolver-query-many";
// import ResolverMutationCreate from "./resolver-mutation-create";
// import ResolverMutationUpdate from "./resolver-mutation-update";
// import ResolverMutationDelete from "./resolver-mutation-delete";

export default function Resolvers(ast: TAST, options: TOptions) {
  const { name } = ast;

  const Root = ResolverRoot(ast, options);
  const One = ResolverQueryOne(ast, options);
  const Many = ResolverQueryMany(ast, options);
  // const Create = ResolverMutationCreate();
  // const Update = ResolverMutationUpdate();
  // const Delete = ResolverMutationDelete();

  const graphResolversRoot = {
    [`${name}`]: Root,
  };

  const graphResolversQuery = {
    [`${name}`]: One,
    [`${name}Many`]: Many,
  };

  const graphResolversMutation = {
    // [`${name}_create`]: Create,
    // [`${name}_update`]: Update,
    // [`${name}_delete`]: Delete,
  };

  return {
    Root: graphResolversRoot,
    Query: graphResolversQuery,
    Mutation: graphResolversMutation,
  };
}
