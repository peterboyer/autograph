import { Model } from "../model/model";
import { Graph } from "../types/graph";
import {
  getRootType,
  getRootListType,
  getRootCreateInput,
  getRootUpdateInput,
  getRootFiltersInput,
  getQueryOneResolver,
  getQueryManyResolver,
  getMutationCreateResolver,
  getMutationUpdateResolver,
  getMutationDeleteResolver,
  getOtherTypeDefs,
} from "./typedefs-utils/typedefs";
import { getDocs } from "./typedefs-utils/docs";

const identity = <T>(a: T) => a;

export default function buildTypeDefs(model: Model): Graph["typeDefs"] {
  const docs = getDocs(model);

  const root = [
    getRootType(model),
    getRootListType(model),
    getRootCreateInput(model),
    getRootUpdateInput(model),
    getRootFiltersInput(model),
    getOtherTypeDefs(model, "root"),
  ]
    .filter(identity)
    .join("\n");

  const query = [
    docs.queryOne,
    getQueryOneResolver(model),
    docs.queryMany,
    getQueryManyResolver(model),
    getOtherTypeDefs(model, "query"),
  ]
    .filter(identity)
    .join("\n");

  const mutation = [
    docs.mutationCreate,
    getMutationCreateResolver(model),
    docs.mutationUpdate,
    getMutationUpdateResolver(model),
    docs.mutationDelete,
    getMutationDeleteResolver(model),
    getOtherTypeDefs(model, "mutation"),
  ]
    .filter(identity)
    .join("\n");

  return {
    root,
    query,
    mutation,
  };
}
