/**
 * @module Remote
 */

import graphql from "graphql";
const { print } = graphql;
import graphqlTools from "graphql-tools";
const {
  introspectSchema,
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  mergeSchemas,
} = graphqlTools;

/**
 * Creates a GraphQL Executor for use with GraphQL Remote Executable Schemas.
 *
 * @function
 * @static
 * @param {object} config
 * @param {string} config.uri
 *    Target GraphQL API. (e.g. http://localhost:4000/graphql)
 * @param {(function|object)} [config.context={}]
 *    Callback that receives the execution context to be able to manipulate the
 *    fetch function. Currently only adding additional headers is supported. If
 *    passed an object, it is used as-is to provide manipulations to the fetch
 *    function.
 * @param {object} [config.context.headers={}]
 *    Object of [header]:[value] pairs to add to the fetch request.
 * @param {Fetch} config.fetch
 *    Fetch implementation. (i.e. node-fetch)
 *
 * @returns {GraphQL.Executor}
 */
export function Executor({ uri, context, fetch }) {
  return async (operation) => {
    const {
      headers = {}
    } = (
      typeof context === "function"
        ? context(operation.context)
        : context
    ) || {};

    const { document, variables } = operation;
    const query = print(document);
    const result = await fetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
      body: JSON.stringify({ query, variables })
    });

    return result.json();
  };
}

/**
 * Creates a GraphQL Remote Executable Schema.
 *
 * @function
 * @static
 * @param {GraphQL.Executor} executor
 * @returns {GraphQL.RemoteExecutableSchema}
 */
export async function RemoteExecutableSchema(executor) {
  const schema = await introspectSchema(executor);
  const schemaExecutable = makeRemoteExecutableSchema({ schema, executor });
  return schemaExecutable;
}
