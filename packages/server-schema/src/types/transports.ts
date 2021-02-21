import { Sources } from "./sources";
import { Context } from "./context";

export interface Transports {
  "internal-query": {
    name: keyof Sources;
    id?: string | null;
    cursor?: string;
    limit?: number;
    order?: {
      target: string;
      direction: "asc" | "desc";
    };
    filters?: {
      target: string;
      operator: string;
      value: any;
    }[];
    context: Context;
  };
  "internal-mutation": {
    name: string;
    id?: string;
    data?: Record<string, any>;
    context: Context;
  };
}

export type QueryTransports = Omit<Transports, "internal-mutation">;

export type MutationTransports = Pick<Transports, "internal-mutation">;
