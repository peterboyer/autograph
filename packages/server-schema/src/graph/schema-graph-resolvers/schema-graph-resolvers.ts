// @ts-nocheck

import { TSchemaAST } from "../schema-graph-types";

import ResolverRoot from "./resolver-root";
// import ResolverQueryOne from "./resolver-query-one";
// import ResolverQueryMany from "./resolver-query-many";
// import ResolverMutationCreate from "./resolver-mutation-create";
// import ResolverMutationUpdate from "./resolver-mutation-update";
// import ResolverMutationDelete from "./resolver-mutation-delete";

export default function Resolvers(ast: TSchemaAST) {
  const { name } = ast;
  // const { query, filters, limitDefault, limitMaxDefault } = ast;

  // const queryOne = query?.one || query?.default;
  // const queryMany = query?.many || query?.default;

  const fields = new Map(Object.entries(ast.fields));
  // const _filters = new Map(Object.entries(filters || {}));

  // const queryByIdOrThrow = async (..._args: Parameters<typeof queryById>) => {
  //   const result = await queryById(..._args);
  //   if (!result) {
  //     const [table, args, resolverArgs] = _args;
  //     throw errors.NotFound(table, args, resolverArgs);
  //   }
  //   return result;
  // };

  const graphResolversRoot = {
    [`${name}`]: ResolverRoot(ioc)(fields),
  };

  const graphResolversQuery = {
    // [`${name}`]: ResolverQueryOne(ioc)(queryOne),
    // [`${name}_many`]: ResolverQueryMany(ioc)(fields, _filters, queryMany),
  };

  const graphResolversMutation = {
    // [`${name}_create`]: ResolverMutationCreate(ioc)(fields),
    // [`${name}_update`]: ResolverMutationUpdate(ioc)(fields),
    // [`${name}_delete`]: ResolverMutationDelete(ioc)(fields),
  };

  return {
    Root: graphResolversRoot,
    Query: graphResolversQuery,
    Mutation: graphResolversMutation,
  };
}
