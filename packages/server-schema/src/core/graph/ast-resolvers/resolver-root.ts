import { TResolver } from "../../types/types-graphql";
import { TField } from "../../types/types-ast";
import TOptions from "./ast-resolvers-options";

export function mapRoot(fields: Map<string, TField>, options: TOptions) {
  const root: Record<any, TResolver> = {};

  for (const [nodeName, node] of fields) {
    const {
      type,
      resolver: { get: resolverGet },
    } = node;

    if (resolverGet) {
      root[nodeName] = async (...resolverArgs) => {
        const { transactor } = resolverGet;
        const result = await transactor()(...resolverArgs);
        if (type._is === "object") {
          const id = result;
          const name = type.name;

          const [queryResult] = await options.onQuery({
            name,
            id,
          });

          if (!queryResult && type.isNonNull) {
            throw new Error("@AS/NOT_FOUND");
          }

          return queryResult;
        }
        return result;
      };
    }
  }

  return root;
}

export default mapRoot;
