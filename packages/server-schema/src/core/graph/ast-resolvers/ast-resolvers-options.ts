import { TResolver } from "../../types/types-graphql";

export type TQuery<TContext = any> = {
  name: string;
  id?: string;
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
  context: TContext;
};

export type TMutation<TContext = any> = {
  name: string;
  id?: string;
  data?: Record<string, any>;
  context: TContext;
};

export type TQueryList = {
  items: Record<string, any>[];
  total: number;
  cursor?: string;
};

export type TOptions<Context = any> = {
  onQuery: (query: TQuery) => Promise<TQueryList>;
  onMutation: (mutation: TMutation) => Promise<Record<string, any> | undefined>;
  middleware?: (
    resolverArgs: Parameters<TResolver<any, any, Context>>,
    next: TResolver
  ) => Promise<any>;
};

export default TOptions;
