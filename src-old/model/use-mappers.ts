import { Type, Scalar } from "../types/type";
import { GetMapper, SetMapper } from "./field-options";

export function useMappers<
  Source,
  GetType extends Type,
  SetType extends Scalar
>() {
  const getMapper: GetMapper<Source, GetType> = (resolver) => ({
    args: {},
    resolver: (...args) => resolver(args[0], args[2], args[3]),
  });
  getMapper.args = (args) => (resolver) => ({
    args,
    resolver,
  });

  const setMapper: SetMapper<Source, SetType> = (resolver) => ({
    resolver,
  });

  const setAfterData: typeof setMapper["afterData"] = (resolver) => ({
    resolver,
  });

  setMapper.afterData = setAfterData;

  const create: typeof setMapper["create"] = (resolver) => ({
    resolver: (...args) => resolver(args[0], args[2], args[3]),
  });

  const createAfterData: typeof setMapper["create"]["afterData"] = (
    resolver
  ) => ({
    resolver,
  });

  create.afterData = createAfterData;
  setMapper.create = create;

  const update: typeof setMapper["update"] = (resolver) => ({
    resolver,
  });

  const updateAfterData: typeof setMapper["update"]["afterData"] = (
    resolver
  ) => ({
    resolver,
  });

  update.afterData = updateAfterData;
  setMapper.update = update;

  return { get: getMapper, set: setMapper };
}
