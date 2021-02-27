import { Cursor } from "../types/cursor";
import { CursorStore } from "../types/cursor";

export type Generator = () => string;

export class MemoryCursorStore implements CursorStore {
  store: Map<string, Cursor>;
  generator: Generator;

  constructor(generator?: Generator) {
    this.store = new Map();
    this.generator = generator || (() => Math.random().toString().substr(2));
  }

  async newId() {
    let id = null;
    do {
      id = this.generator();
    } while (!(id && !(await this.get(id))));
    return id;
  }

  async get(id: string) {
    return this.store.get(id);
  }

  async set(id: string, cursor: Cursor) {
    this.store.set(id, cursor);
  }

  async remove(id: string) {
    this.store.delete(id);
  }
}
