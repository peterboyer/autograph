import Cursor from "./cursor";
import CursorStore from "./cursor-store";

type TGenerator = () => string;

class MemoryCursorStore implements CursorStore {
  store: Map<string, Cursor>;
  generator: TGenerator;

  constructor(generator: TGenerator) {
    this.store = new Map();
    this.generator = generator;
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

export default MemoryCursorStore;
