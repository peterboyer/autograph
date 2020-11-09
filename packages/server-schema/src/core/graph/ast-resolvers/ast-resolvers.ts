import { TSchemaAST } from "../../types/types-schema-ast";
import TOptions from "./ast-resolvers-options";

import mapRoot from "./ast-map-root";
// import ResolverQueryOne from "./resolver-query-one";
// import ResolverQueryMany from "./resolver-query-many";
// import ResolverMutationCreate from "./resolver-mutation-create";
// import ResolverMutationUpdate from "./resolver-mutation-update";
// import ResolverMutationDelete from "./resolver-mutation-delete";

export default function Resolvers(ast: TSchemaAST, context: TOptions) {
  const { name } = ast;
  // const { query, filters, limitDefault, limitMaxDefault } = ast;

  const fields = new Map(Object.entries(ast.fields));
  // const _filters = new Map(Object.entries(filters || {}));

  const Root = mapRoot(fields, context);
  // const One = mapOne();
  // const Many = mapMany();
  // const Create = mapCreate();
  // const Update = mapUpdate();
  // const Delete = mapDelete();

  const graphResolversRoot = {
    [`${name}`]: Root,
  };

  const graphResolversQuery = {
    // [`${name}`]: One,
    // [`${name}_many`]: Many,
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
