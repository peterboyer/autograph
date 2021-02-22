import { Type } from "../types/type";
import { asScalar } from "../types/type-utils";
import { GetMapper, SetMapper } from "./field-options";

export function useMappers<Source, T extends Type>(defaultType: T) {
  const getMapper: GetMapper<Source, T> = (resolver) => ({
    args: {},
    resolver: (...args) => resolver(args[0], args[2], args[3]),
  });
  getMapper.with = (args) => (resolver) => ({
    args,
    resolver,
  });

  const setMapper: SetMapper<Source, T> = (resolver) => ({
    type: asScalar(defaultType),
    resolver,
  });
  setMapper.with = (type) => (resolver) => ({
    type: asScalar(type),
    resolver,
  });

  const create: typeof setMapper["create"] = (resolver) => ({
    type: asScalar(defaultType),
    resolver: (...args) => resolver(args[0], args[2], args[3]),
  });
  create.with = (type) => (resolver) => ({
    type: type,
    resolver: (...args) => resolver(args[0], args[2], args[3]),
  });

  const createToAction: typeof setMapper["create"]["toAction"] = (
    resolver
  ) => ({
    type: asScalar(defaultType),
    resolver,
  });
  createToAction.with = (type) => (resolver) => ({
    type: asScalar(type),
    resolver,
  });
  create.toAction = createToAction;
  setMapper.create = create;

  const update: typeof setMapper["update"] = (resolver) => ({
    type: asScalar(defaultType),
    resolver,
  });
  update.with = (type) => (resolver) => ({
    type: asScalar(type),
    resolver,
  });

  const updateToAction: typeof setMapper["update"]["toAction"] = (
    resolver
  ) => ({
    type: asScalar(defaultType),
    resolver,
  });
  updateToAction.with = (type) => (resolver) => ({
    type: asScalar(type),
    resolver,
  });
  update.toAction = updateToAction;
  setMapper.update = update;

  return { get: getMapper, set: setMapper };
}
