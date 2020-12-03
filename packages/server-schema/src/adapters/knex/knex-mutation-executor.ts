import Knex from "knex";

export type TKnexMutation = {
  from: string;
  id?: number;
  data?: any;
  trx?: Knex.Transaction;
};

class KnexMutationExecutor {
  knex: Knex;

  constructor(knex: Knex) {
    this.knex = knex;
  }

  async execute(mutation: TKnexMutation) {
    const { trx, from, id, data } = mutation;

    const exec = this.knex(from);

    if (trx) exec.transacting(trx);

    /**
     * CREATE
     */
    if (data && !id) {
      const [id] = await exec.insert(data).returning("id");
      return id as number;
    }

    /**
     * UPDATE
     */
    if (data && id) {
      await exec.where({ id }).update(data).returning("id");
      return id as number;
    }

    /**
     * DELETE
     */
    if (!data && id) {
      await exec.where({ id }).delete();
      return;
    }

    throw new Error("USE_MUTATION_INVALID_QUERY");
  }
}

export default KnexMutationExecutor;
