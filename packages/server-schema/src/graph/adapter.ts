import {
  QueryTransport,
  MutationTransport,
  AdapterTransport,
} from "../types/transports";

export interface Adapter {
  onQuery(
    query: QueryTransport,
    queryModifier?: QueryModifier
  ): Promise<QueryResponse>;
  onMutation(mutation: MutationTransport): Promise<Record<string, any>>;
}

export type QueryModifier = (query: AdapterTransport) => void;

export type QueryResponse = {
  items: Record<string, any>[];
  total: number;
  cursor?: string;
};
