import Knex from "knex";
import { Adapter } from "../../types/adapter";
import { CursorStore, MemoryCursorStore } from "../../cursor";
import { onQuery } from "./on-query";
import { onMutation } from "./on-mutation";
import getUseQuery from "./use-query";
import getUseMutation from "./use-mutation";

type Options = {
  tableNames?: Map<string, string>;
  cursorStore?: CursorStore;
};

export class KnexAdapter implements Adapter {
  onQuery: Adapter["onQuery"];
  onMutation: Adapter["onMutation"];

  constructor(knex: Knex, options: Options) {
    const { tableNames, cursorStore = new MemoryCursorStore() } = options;

    const useQuery = getUseQuery(knex, { tableNames });
    this.onQuery = onQuery({ useQuery, cursorStore });

    const useMutation = getUseMutation(knex, { tableNames });
    this.onMutation = onMutation({ useQuery, useMutation });
  }
}
