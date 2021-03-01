import { ModelAny } from "../../model/model";
import { Resolver } from "../../types/resolver";
import { Adapter } from "../../types/adapter";

export function getRootResolver(model: ModelAny, adapter: Adapter) {
  const acc: Record<string, Resolver> = {};
  Object.values(model.fields).forEach((field) => {
    const { get } = field;
    if (!get) return;

    const { name, type } = field;
    acc[name] = async (...resolverArgs) => {
      const [source, , context, info] = resolverArgs;

      // access READ
      const onRead = field.hooks.onRead;
      const onAccess = field.hooks.onAccess;
      const hookArgs = [source, context, info] as const;
      onRead && (await onRead(...hookArgs));
      onAccess && (await onAccess(...hookArgs));

      const result = await get.resolver(...resolverArgs);

      // pass-through complete objects/arrays that don't need resolution
      if (result && typeof result === "object") return result;

      if (type.get._is === "object") {
        const id = result;
        const name = type.get.name;

        const {
          items: [item],
        } = await adapter.onQuery({
          name,
          id,
          context,
        });

        if (!item && type.get.isNonNull) {
          throw new Error("NOT_FOUND");
        }

        return item;
      }
      return result;
    };
  });
  return {
    [model.name]: acc,
  };
}
