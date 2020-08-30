// TODO: solve this now suppressed error
// @ts-ignore: TS2307
// Cannot find module 'apollo-server' or its corresponding type declarations.
import apollo from "apollo-server";
const { ApolloError } = apollo;

export default function SchemaGraphQLApollo() {
  function NotFound(tableName: string, queryArgs: {} = {}) {
    return new ApolloError(
      `Cannot resolve '${tableName}' with ${JSON.stringify(queryArgs).replace(
        /"/g,
        ""
      )}.`,
      "NOT_FOUND",
      queryArgs
    );
  }

  function NotValid(details?: {}) {
    return new ApolloError("Invalid arguments.", "NOT_VALID", details);
  }

  return {
    errors: {
      NotFound,
      NotValid,
    },
  };
}
