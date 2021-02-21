import { Sources } from "./sources";
import { Context } from "./context";

export interface QueryTransports {
  "internal-query": {
    name: Exclude<keyof Sources, number | symbol>;
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
}

export interface MutationTransports<Source = {}> {
  "internal-mutation": {
    name: string;
    id?: string;
    data?: Partial<Record<Exclude<keyof Source, number | symbol>, any>>;
    context: Context;
  };
}
