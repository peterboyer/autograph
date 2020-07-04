import fetch from "node-fetch";
import graphql from "graphql";
const { print } = graphql;
import graphqlTools from "graphql-tools";
const { introspectSchema, makeExecutableSchema, makeRemoteExecutableSchema, mergeSchemas } = graphqlTools;

export const Executor = ({ uri, fetch }) => async ({ document, variables }) => {
  const query = print(document);
  const fetchResult = await fetch(uri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables })
  });
  return fetchResult.json();
};

export async function RemoteSchema(uri) {
  const executor = Executor({ uri, fetch });
  const schema = await introspectSchema(executor);
  const schemaExecutable = makeRemoteExecutableSchema({ schema, executor });
  return schemaExecutable;
}
