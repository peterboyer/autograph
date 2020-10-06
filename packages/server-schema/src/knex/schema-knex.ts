import Knex from "knex";
import { types, Types } from "./schema-knex-types";
export * from "./schema-knex-types";

export const presets = {
  id: {
    type: types.ID,
    primary: true,
    nullable: false,
  } as const,
  created_at: (knex: Knex) =>
    ({
      type: types.DATETIME,
      nullable: false,
      default: knex.fn.now(),
    } as const),
  updated_at: (knex: Knex) =>
    ({
      type: types.DATETIME,
      nullable: false,
      default: knex.fn.now(),
    } as const),
};

export const schema = (knex: Knex) => {
  type TNode = {
    type: keyof Types;
    primary?: boolean;
    unique?: boolean;
    nullable?: boolean;
    default?: any;
    relationship?: boolean | string;
    relationshipOnDelete?: string;
    relationshipOnUpdate?: string;
  };

  type TNodes = { [key: string]: TNode };

  return <T extends TNodes>(name: string, nodes: T) => {
    const _nodes = {
      id: nodes.id || presets.id,
      created_at: nodes.created_at || presets.created_at(knex),
      updated_at: nodes.updated_at || presets.updated_at(knex),
      ...nodes,
    };

    return {
      name,
      nodes: _nodes,
    };
  };
};

export default schema;
