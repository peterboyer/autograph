import { QueryTransport } from "../types/transports";

export interface Cursor {
  query: QueryTransport;
  total: number;
  position: number;
}
