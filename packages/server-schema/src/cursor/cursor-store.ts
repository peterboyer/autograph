import { Cursor } from "./cursor";

export interface CursorStore {
  newId(): Promise<string>;
  get(id: string): Promise<Cursor | undefined>;
  set(id: string, cursor: Cursor): Promise<void>;
  remove(id: string): Promise<void>;
}
