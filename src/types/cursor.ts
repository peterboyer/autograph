import { QueryTransport } from "./transports";

export interface Cursor {
  query: QueryTransport;
  total: number;
  position: number;
}

export interface CursorStore {
  newId(): Promise<string>;
  get(id: string): Promise<Cursor | undefined>;
  set(id: string, cursor: Cursor): Promise<void>;
  remove(id: string): Promise<void>;
}
