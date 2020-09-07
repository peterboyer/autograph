import apollo from "apollo-server";
import { IErrorNotFound, IErrorNotValid } from "./SchemaGraphQL.types";
const { ApolloError } = apollo;

export default function SchemaGraphQLApollo() {
  const NotFound: IErrorNotFound = (tableName, query) => {
    return new ApolloError(
      `Cannot resolve '${tableName}' with ${JSON.stringify(query).replace(
        /"/g,
        ""
      )}.`,
      "NOT_FOUND",
      query
    );
  };

  const NotValid: IErrorNotValid = (extensions?) => {
    return new ApolloError("Invalid arguments.", "NOT_VALID", extensions);
  };

  return {
    errors: {
      NotFound,
      NotValid,
    },
  };
}
