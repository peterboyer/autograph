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
      TResolver<undefined, { ids: string[]; data: Record<string, any>[] }>
    >
  ) => {
    const { name } = ast;
    const [, args, context] = resolverArgs;

    const mutation_default: TMutation = {
      name,
      context,
    };

    if (operation === "delete") {
      const { ids } = args;
      await Promise.all(
        ids.map(async (id) => {
          const mutation = { ...mutation_default, id };
          await options.onMutation(mutation);
        })
      );
      return ids;
    }

    const { data: datas } = args;
    // resolve all setters for each item to resolve insert data
    const dataResolvers = await Promise.all(
      datas.map(async (data) => {
        /**
         * id
         */
        const id = operation === "update" ? (data.id as string) : undefined;

        /**
         * preData
         */
        const preData: Record<string, any> = {};
        await Promise.all(
          Object.entries(data).map(async ([fieldName, value]) => {
            const field = ast.fields[fieldName];
            const {
              resolver: { set: resolverSet },
            } = field;
            if (!resolverSet) return;
            if (resolverSet.stage !== "pre") return;
            const { transactor } = resolverSet;
            const result = (await transactor(value, context)) as
              | Record<string, any>
              | undefined;
            if (result) {
              if (typeof result === "object") {
                Object.assign(preData, result);
              } else {
                preData[fieldName] = result;
              }
            }
          })
        );

        /**
         * postData
         */
        const postDataCallback = async (
          source: Record<string, any>
        ): Promise<Record<string, any>> => {
          const postData: Record<string, any> = {};
          await Promise.all(
            Object.entries(data).map(async ([fieldName, value]) => {
              const field = ast.fields[fieldName];
              const {
                resolver: { set: resolverSet },
              } = field;
              if (!resolverSet) return;
              if (resolverSet.stage !== "post") return;
              const { transactor } = resolverSet;
              const result = (await transactor(source, value, context)) as
                | Record<string, any>
                | undefined;
              if (result) {
                if (typeof result === "object") {
                  Object.assign(postData, result);
                } else {
                  postData[fieldName] = result;
                }
              }
            })
          );
          return postData;
        };

        return {
          id,
          preData,
          postDataCallback,
        };
      })
    );

    const items: Record<string, any>[] = [];
    await Promise.all(
      dataResolvers.map(async ({ id, preData, postDataCallback }) => {
        /**
         * preMutation
         */
        const preMutation = {
          ...mutation_default,
          id,
          data: preData,
        };

        /**
         * preItem --- to be used as source for postMutation
         */
        const preItem = await options.onMutation(preMutation);

        /**
         * postMutation
         */
        const source = preItem as NonNullable<typeof preItem>;
        const postData = await postDataCallback(source);
        // only if postData setters have provided new values
        if (Object.keys(postData).length) {
          const postMutation = {
            ...mutation_default,
            id,
            data: postData,
          };

          /**
           * postItem -> result
           */
          const postItem = await options.onMutation(postMutation);
          if (postItem) items.push(postItem);
        }

        /**
         * preItem -> result
         */
        if (preItem) items.push(preItem);
      })
    );

    return items;
  };
}

export default ResolverMutation;
