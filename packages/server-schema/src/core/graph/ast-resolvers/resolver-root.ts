import { TAST } from "../../types/types-ast";
import { TResolver } from "../../types/types-graphql";
import TOptions from "./ast-resolvers-options";

export function mapRoot(ast: TAST, options: TOptions) {
  const root: Record<any, TResolver> = {};

  for (const [nodeName, node] of Object.entries(ast.fields)) {
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

          const {
            items: [item],
          } = await options.onQuery({
            name,
            id,
          });

          if (!item && type.isNonNull) {
            throw new Error("@AS/NOT_FOUND");
          }

          return item;
        }
        return result;
      };
    }
  }

  return root;
}

export default mapRoot;
