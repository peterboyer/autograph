import { Type } from "../types/type";
import { asScalar } from "../types/type-utils";
import { GetMapper, SetMapper } from "./field-options";

export function useMappers<Source, T extends Type>(defaultType: T) {
  const getMapper: GetMapper<Source, T> = (resolver) => ({
    resolver: (...args) => resolver(args[0], args[2], args[3]),
    args: undefined,
  });
  getMapper.with = (args) => (resolver) => ({
    args,
    resolver,
  });

  const setMapper: SetMapper<Source, T> = (resolver) => ({
    type: asScalar(defaultType),
    stage: "data",
    resolver,
  });
  setMapper.with = (type) => (resolver) => ({
    type: asScalar(type),
    stage: "data",
    resolver,
  });

  const create: typeof setMapper["create"] = (resolver) => ({
    type: asScalar(defaultType),
    stage: "data",
    resolver: (...args) => resolver(args[0], args[2], args[3]),
  });
  create.with = (type) => (resolver) => ({
    type: type,
    stage: "data",
    resolver: (...args) => resolver(args[0], args[2], args[3]),
  });

  const createToAction: typeof setMapper["create"]["toAction"] = (
    resolver
  ) => ({
    type: asScalar(defaultType),
    stage: "action",
    resolver,
  });
  createToAction.with = (type) => (resolver) => ({
    type: asScalar(type),
    stage: "action",
    resolver,
  });
  create.toAction = createToAction;
  setMapper.create = create;

  const update: typeof setMapper["update"] = (resolver) => ({
    type: asScalar(defaultType),
    stage: "data",
    resolver,
  });
  update.with = (type) => (resolver) => ({
    type: asScalar(type),
    stage: "data",
    resolver,
  });

  const updateToAction: typeof setMapper["update"]["toAction"] = (
    resolver
  ) => ({
    type: asScalar(defaultType),
    stage: "action",
    resolver,
  });
  updateToAction.with = (type) => (resolver) => ({
    type: asScalar(type),
    stage: "action",
    resolver,
  });
  update.toAction = updateToAction;
  setMapper.update = update;

  return { get: getMapper, set: setMapper };
}
