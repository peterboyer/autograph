import Knex from "knex";
import { Adapter } from "../../graph/ast-resolvers/ast-resolvers-options";

import CursorStore from "./cursor/cursor-store";

import OnQuery from "./on-query";
import UseQuery from "./use-query";
import OnMutation from "./on-mutation";
import UseMutation from "./use-mutation";

type TOptions = {
  tableNames: Map<string, string>;
  cursorStore: CursorStore;
};

class KnexAdapter implements Adapter {
  _onQuery: Adapter["onQuery"];
  _onMutation: Adapter["onMutation"];

  constructor(knex: Knex, options: TOptions) {
    const { tableNames, cursorStore } = options;

    const useQuery = UseQuery({ knex, tableNames });
    this._onQuery = OnQuery({ useQuery, cursorStore });

    const useMutation = UseMutation({ knex, tableNames });
    this._onMutation = OnMutation({ useQuery, useMutation });
  }

  onQuery(...args: Parameters<Adapter["onQuery"]>) {
    return this._onQuery(...args);
  }

  onMutation(...args: Parameters<Adapter["onMutation"]>) {
    return this._onMutation(...args);
  }
}

export default KnexAdapter;
