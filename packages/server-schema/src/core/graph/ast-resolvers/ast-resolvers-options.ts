export type TQuery = {
  name: string;
  id?: string;
};

export type TOptions = {
  onQuery: (query: TQuery) => Promise<Object[]>;
};

export default TOptions;
