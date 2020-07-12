/**
 * @module Remote
 */

import graphql from "graphql";
const { print } = graphql;
import graphqlTools from "graphql-tools";
const {
  introspectSchema,
  makeRemoteExecutableSchema,
} = graphqlTools;
import lodash from "lodash";
const { merge } = lodash;

/**
 * Creates a GraphQL Executor for use with GraphQL Remote Executable Schemas.
 *
 * @function
 * @static
 * @param {object} config
 * @param {string} config.uri
 *    Target GraphQL API. (e.g. http://localhost:4000/graphql)
 * @param {(function|object)} [config.fetchOptions={}]
 *    Object of properties to be merged into the fetch request's defaults.
 *    If passed a function it will be evaluated, with `(context, fetchDefaults)`
 *    passed as arguments.
 * @param {Fetch} config.fetch
 *    Fetch implementation. (i.e. node-fetch)
 * @param {function} [config.onResponse]
 *    Callback fired on executor response with args `(response, context)`;
 *
 * @returns {GraphQL.Executor}
 */
export function Executor({ uri, fetch, fetchOptions, onResponse }) {
  return async (operation) => {
    const { document, variables } = operation;

    const query = print(document);
    const fetchDefaults = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables })
    };

    const { context } = operation;
    const fetchOverrides = (
      typeof fetchOptions === "function"
        ? fetchOptions(context, fetchDefaults)
        : fetchOptions
    ) || {};

    const result = await fetch(uri, merge(fetchDefaults, fetchOverrides));

    const response = await result.json();
    onResponse && await onResponse(response, context);
    return response;
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
