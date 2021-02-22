import { Graph } from "../types/graph";
import { ModelAny } from "../model/model";
import { Adapter } from "./adapter";
import { getRootResolver } from "./resolvers-utils/resolver-root";
import { getQueryOneResolver } from "./resolvers-utils/resolver-query-one";
import { getQueryManyResolver } from "./resolvers-utils/resolver-query-many";
import {
  getMutationCreateResolver,
  getMutationUpdateResolver,
  getMutationDeleteResolver,
} from "./resolvers-utils/resolver-mutation";

export default function buildResolvers(
  model: ModelAny,
  adapter: Adapter
): Graph["resolvers"] {
  const root = Object.assign({}, getRootResolver(model, adapter));
  const query = Object.assign(
    {},
    getQueryOneResolver(model, adapter),
    getQueryManyResolver(model, adapter)
  );
  const mutation = Object.assign(
    {},
    getMutationCreateResolver(model, adapter),
    getMutationUpdateResolver(model, adapter),
    getMutationDeleteResolver(model, adapter)
  );

  return {
    root,
    query,
    mutation,
  };
}
