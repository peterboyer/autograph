import {
  QueryTransport,
  MutationTransport,
  AdapterTransport,
} from "./transports";

export interface Adapter<Q = AdapterTransport> {
  onQuery(
    query: QueryTransport,
    queryModifier?: QueryModifier<Q>
  ): Promise<QueryResponse>;
  onMutation(
    mutation: MutationTransport
  ): Promise<Record<string, any> | undefined>;
}

export type QueryModifier<Q = AdapterTransport> = (query: Q) => void;

export type QueryResponse = {
  items: Record<string, any>[];
  total: number;
  cursor?: string;
};
