import apollo from "apollo-server";
import { IErrorNotFound, IErrorNotValid } from "./SchemaGraphQL.types";
const { ApolloError } = apollo;

export default function SchemaGraphQLApollo() {
  const NotFound: IErrorNotFound = (tableName, query) => {
    return new ApolloError("NOT_FOUND", "NOT_FOUND", query);
  };

  const NotValid: IErrorNotValid = (extensions?) => {
    return new ApolloError("NOT_VALID", "NOT_VALID", extensions);
  };

  return {
    errors: {
      NotFound,
      NotValid,
    },
  };
}
