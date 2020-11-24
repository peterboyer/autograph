export type TQuery<TContext = unknown> = {
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

export type TMutation<TContext = unknown> = {
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

export type TOptions = {
  onQuery: (query: TQuery) => Promise<TQueryList>;
  onMutation: (mutation: TMutation) => Promise<Record<string, any> | undefined>;
};

export default TOptions;
