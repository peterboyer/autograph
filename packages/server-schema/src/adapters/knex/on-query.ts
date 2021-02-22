import CursorStore from "./cursor/cursor-store";
import {
  Adapter,
  TQuery,
  TQueryResolver,
} from "../../graph/resolvers-utils/ast-resolvers-options";

export type TOnQueryOptions = {
  useQuery: (
    query: TQuery,
    options?: {
      index?: any[];
      queryResolver?: TQueryResolver;
    }
  ) => Promise<{
    items: Object[];
    total: number;
    index?: any[];
  }>;
  cursorStore: CursorStore;
};

const constructor = ({ useQuery, cursorStore }: TOnQueryOptions) => {
  const onQuery: Adapter["onQuery"] = async (query, queryResolver) => {
    if ("id" in query) {
      const { items, total } = await useQuery(query, { queryResolver });
      return { items, total };
    }

    if ("cursor" in query) {
      const { name, cursor: cursorArg } = query;
      const cursorId = `${name}:${cursorArg}`;
      const cursor = await cursorStore.get(cursorId);
      if (!cursor) {
        throw new Error("QUERY_CURSOR_INVALID");
      }

      // overwrite cursor query context (to prevent stale trx)
      cursor.query.context = query.context;

      const { items, index } = await useQuery(cursor.query, {
        index: cursor.index,
        queryResolver,
      });
      if (index) {
        await cursorStore.set(cursorId, {
          query: cursor.query,
          total: cursor.total,
          index,
        });
        return { items, total: cursor.total, cursor: cursorArg };
      }
      await cursorStore.remove(cursorId);
      return { items, total: cursor.total };
    }

    const { items, total, index } = await useQuery(query, { queryResolver });
    if (index) {
      const { name } = query;
      const cursorArg = await cursorStore.newId();
      const cursorId = `${name}:${cursorArg}`;
      await cursorStore.set(cursorId, { query, total, index });
      return { items, total, cursor: cursorArg };
    }
    return { items, total };
  };

  return onQuery;
};

export default constructor;
