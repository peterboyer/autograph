import Knex from "knex";
import { TOnMutationOptions } from "./on-mutation";
import KnexMutationExecutor, { TKnexMutation } from "./knex-mutation-executor";

type TKnexMutationOption = {
  knex: Knex;
  tableNames: Map<string, string>;
};

const constructor = ({
  knex,
  tableNames: _tableNames,
}: TKnexMutationOption) => {
  const tableNames = _tableNames || new Map<string, string>();
  const knexMutationExecutor = new KnexMutationExecutor(knex);

  const useMutation: TOnMutationOptions["useMutation"] = async (query) => {
    const { name: queryName } = query;
    const from = tableNames.get(queryName) || queryName;

    const { id: queryId } = query;
    const id = (queryId && parseInt(queryId)) || undefined;

    const { data: queryData } = query;
    const data = queryData;

    const knexMutation: TKnexMutation = {
      from,
      id,
      data,
    };

    const nextId = await knexMutationExecutor.execute(knexMutation);
    const _nextId = (nextId && nextId.toString()) || undefined;

    return _nextId;
  };

  return useMutation;
};

export default constructor;
