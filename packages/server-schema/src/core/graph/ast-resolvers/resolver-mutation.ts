import { TAST } from "../../types/types-ast";
import { TResolver } from "../../types/types-graphql";
import TOptions, { TMutation } from "./ast-resolvers-options";

export type TOperation = "create" | "update" | "delete";

export function ResolverMutation(
  ast: TAST,
  options: TOptions,
  operation: TOperation
) {
  return async (
    ...resolverArgs: Parameters<
      TResolver<undefined, { ids: string[]; data: any[] }>
    >
  ) => {
    const { name } = ast;

    const [, args, context] = resolverArgs;

    if (operation === "delete") {
      const { ids } = args;
      await Promise.all(
        ids.map(async (id) => {
          const mutation: TMutation = {
            name,
            id,
            context,
          };
          await options.onMutation(mutation);
        })
      );
      return ids;
    }

    const { data: _datas } = args;
    // resolve all setters for each item to resolve insert data
    const datas = await Promise.all(
      _datas.map(async (data) => {
        const item: Record<string, any> = {};
        await Promise.all(
          Object.entries(data).map(async ([fieldName, value]) => {
            const field = ast.fields[fieldName];
            const {
              resolver: { set: resolverSet },
            } = field;
            if (!resolverSet) return;
            if (resolverSet.stage !== "pre") return;
            const { transactor } = resolverSet;
            const result = await transactor(value, context);
            if (result && typeof result === "object") {
              Object.assign(item, result);
            } else {
              item[fieldName] = result;
            }
          })
        );
        return item;
      })
    );

    const items: Record<string, any>[] = [];
    await Promise.all(
      datas.map(async (data) => {
        const id = operation === "update" ? data.id : undefined;
        const mutation: TMutation = {
          name,
          id,
          data,
          context,
        };
        const item = await options.onMutation(mutation);
        if (item) items.push(item);
      })
    );

    return items;
  };
}

export default ResolverMutation;
