import { ApolloServerPlugin } from "apollo-server-plugin-base";

export type Options<Trx> = {
  onStart: () => Promise<Trx> | Trx;
  onCommit: (trx: Trx) => Promise<void> | void;
  onRollback: (trx: Trx) => Promise<void> | void;
};

export function TransactionPlugin<Trx>({
  onStart,
  onCommit,
  onRollback,
}: Options<Trx>) {
  const plugin: ApolloServerPlugin = {
    requestDidStart(req) {
      return {
        async willSendResponse() {
          const trx = req.context.trx;
          if (trx) {
            await onCommit(trx);
            req.context.trx = undefined;
          }
        },
        async didEncounterErrors() {
          const trx = req.context.trx;
          if (trx) {
            await onRollback(trx);
            req.context.trx = undefined;
          }
        },
      };
    },
  };

  const init = async () => {
    const trx = await onStart();
    return trx;
  };

  return [plugin, init] as const;
}
