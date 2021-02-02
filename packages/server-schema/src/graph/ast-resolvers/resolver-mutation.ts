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
    const [, args, context, info] = resolverArgs;

    const mutation_default: TMutation = {
      name,
      context,
    };

    async function getItemOrThrow(id: string) {
      // attempt to reslve source using id
      const queryResolver = ast.query.one || ast.query.default || undefined;
      const queryResolverWrapped =
        queryResolver &&
        ((query: Record<string, any>) => queryResolver(query, context));

      const query = { ...mutation_default, id };
      const {
        items: [item],
      } = await options.adapter.onQuery(query, queryResolverWrapped);

      // throw if item not found
      if (!item) throw new Error("NOT_FOUND");

      return item;
    }

    if (operation === "delete") {
      const { ids } = args;
      await Promise.all(
        ids.map(async (id) => {
          const source = await getItemOrThrow(id);

          // hook
          ast.hooks.preDelete && (await ast.hooks.preDelete(source, context));

          // field hooks
          await Promise.all(
            Object.values(ast.fields).map(async (field) => {
              field.onDelete && (await field.onDelete(source, context, info));
            })
          );

          const mutation = { ...mutation_default, id };
          await options.adapter.onMutation(mutation);

          // hook
          ast.hooks.postDelete && (await ast.hooks.postDelete(source, context));

          // field hooks
          await Promise.all(
            Object.values(ast.fields).map(async (field) => {
              field.onDelete_afterCommit &&
                (await field.onDelete_afterCommit(source, context, info));
            })
          );
        })
      );
      return ids;
    }

    const { data: datas } = args;
    // resolve all setters for each item to resolve insert data
    const dataResolvers = await Promise.all(
      datas.map(async (data) => {
        /**
         * id to source
         */
        const id = operation === "update" ? (data.id as string) : undefined;
        let source: Record<string, any> | undefined = undefined;

        if (id) {
          source = await getItemOrThrow(id);
        }

        /**
         * preData
         * go through all fields of data and resolve those fields
         */
        const preData: Record<string, any> = {};
        await Promise.all(
          Object.entries(data).map(async ([fieldName, value]) => {
            const field = ast.fields[fieldName];
            const resolverSet = field.set;
            if (!resolverSet) return;
            if (resolverSet.stage !== "pre") return;
            const { transactor } = resolverSet;
            const result = (await transactor(value, source, context)) as
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

        // field hooks
        if (operation === "create") {
          await Promise.all(
            Object.values(ast.fields).map(async (field) => {
              if (field.onCreate) {
                const result = await field.onCreate(context, info);
                Object.assign(preData, result);
              }
            })
          );
        } else if (operation === "update") {
          await Promise.all(
            Object.values(ast.fields).map(async (field) => {
              if (field.onUpdate) {
                const result = await field.onUpdate(source, context, info);
                Object.assign(preData, result);
              }
            })
          );
        }
        await Promise.all(
          Object.values(ast.fields).map(async (field) => {
            if (field.onCreateAndUpdate) {
              const result = await field.onCreateAndUpdate(
                source,
                context,
                info
              );
              Object.assign(preData, result);
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
              const { set: resolverSet } = field;
              if (!resolverSet) return;
              if (resolverSet.stage !== "post") return;
              const { transactor } = resolverSet;
              const result = (await transactor(value, source, context)) as
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
          source,
          preData,
          postDataCallback,
        };
      })
    );

    const items: Record<string, any>[] = [];
    await Promise.all(
      dataResolvers.map(async (dataResolver) => {
        const {
          id,
          source: preSource,
          preData,
          postDataCallback,
        } = dataResolver;

        /**
         * preMutation
         */
        const preMutation = {
          ...mutation_default,
          id,
          data: preData,
        };

        // hook
        if (preSource)
          ast.hooks.preUpsert &&
            (await ast.hooks.preUpsert(preSource, preData, context));

        /**
         * postSource --- to be used as source for postMutation
         */
        let postSource = await options.adapter.onMutation(preMutation);

        /**
         * postMutation
         */
        const source = postSource as NonNullable<typeof postSource>;
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
          postSource = await options.adapter.onMutation(postMutation);
        }

        // hook
        ast.hooks.postUpsert &&
          (await ast.hooks.postUpsert(
            postSource as NonNullable<typeof postSource>,
            context
          ));

        // field hooks
        if (operation === "create") {
          await Promise.all(
            Object.values(ast.fields).map(async (field) => {
              if (field.onCreate_afterCommit) {
                await field.onCreate_afterCommit(source, context, info);
              }
            })
          );
        } else if (operation === "update") {
          await Promise.all(
            Object.values(ast.fields).map(async (field) => {
              if (field.onUpdate_afterCommit) {
                await field.onUpdate_afterCommit(source, context, info);
              }
            })
          );
        }
        await Promise.all(
          Object.values(ast.fields).map(async (field) => {
            if (field.onCreateAndUpdate_afterCommit) {
              await field.onCreateAndUpdate_afterCommit(source, context, info);
            }
          })
        );

        /**
         * postSource -> result
         */
        if (postSource) items.push(postSource);
      })
    );

    return items;
  };
}

export default ResolverMutation;
