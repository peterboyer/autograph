export type TQuery = {
  name: string;
  id?: string;
  cursor?: string;
  order?: {
    target: string;
    direction: "asc" | "desc";
  };
  limit?: number;
};

export type TQueryList = {
  items: Object[];
  total: number;
  cursor?: string;
};

export type TOptions = {
  onQuery: (query: TQuery) => Promise<TQueryList>;
};

export default TOptions;
