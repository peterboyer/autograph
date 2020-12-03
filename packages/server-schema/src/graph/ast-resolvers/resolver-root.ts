import { TAST } from "../../types/types-ast";
import { TResolver } from "../../types/types-graphql";
import TOptions from "./ast-resolvers-options";

export function mapRoot(ast: TAST, options: TOptions) {
  const root: Record<any, TResolver> = {};

  for (const [fieldName, field] of Object.entries(ast.fields)) {
    const {
      type,
      resolver: { get: resolverGet },
    } = field;

    if (!resolverGet) continue;

    root[fieldName] = async (...resolverArgs) => {
      const [, , context] = resolverArgs;
      const { transactor } = resolverGet;
      const result = await transactor(...resolverArgs);

      // pass-through complete objects/arrays that don't need resolution
      if (result && typeof result === "object") return result;

      if (type._is === "object") {
        const id = result;
        const name = type.name;

        const {
          items: [item],
        } = await options.adapter.onQuery({
          name,
          id,
          context,
        });

        if (!item && type.isNonNull) {
          throw new Error("@AS/NOT_FOUND");
        }

        return item;
      }
      return result;
    };
  }

  return root;
}

export default mapRoot;
