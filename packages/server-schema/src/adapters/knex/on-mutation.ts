import {
  Adapter,
  TQuery,
  TMutation,
} from "../../graph/ast-resolvers/ast-resolvers-options";
import { TOnQueryOptions } from "./on-query";

export type TOnMutationOptions = {
  useQuery: TOnQueryOptions["useQuery"];
  useMutation: (mutation: TMutation) => Promise<string | undefined>;
};

const constructor = ({ useQuery, useMutation }: TOnMutationOptions) => {
  const onMutation: Adapter["onMutation"] = async (mutation) => {
    // raises NOT_FOUND
    const id = await useMutation(mutation);

    if (id) {
      const query_default: TQuery = {
        name: mutation.name,
        context: mutation.context,
      };

      const query = { ...query_default, id };
      const {
        items: [item],
      } = await useQuery(query);

      return item;
    }
    return undefined;
  };
  return onMutation;
};

export default constructor;
