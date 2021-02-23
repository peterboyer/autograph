import { ModelAny } from "../../model/model";
import { Resolver } from "../../types/resolver";
import { Adapter } from "../../types/adapter";
import { Sources } from "../../types/sources";

export function getRootResolver(model: ModelAny, adapter: Adapter) {
  const acc: Record<string, Resolver> = {};
  Object.values(model.fields).forEach((field) => {
    const { get } = field;
    if (!get) return;

    const { name, type } = field;
    acc[name] = async (...resolverArgs) => {
      const result = await get.resolver(...resolverArgs);

      const [, , context] = resolverArgs;
      // pass-through complete objects/arrays that don't need resolution
      if (result && typeof result === "object") return result;

      if (type._is === "object") {
        const id = result;
        const name = type.name;

        const {
          items: [item],
        } = await adapter.onQuery({
          name,
          id,
          context,
        });

        if (!item && type.isNonNull) {
          throw new Error("NOT_FOUND");
        }

        return item;
      }
      return result;
    };
  });
  return acc;
}
