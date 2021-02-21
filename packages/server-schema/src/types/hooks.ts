import { MaybePromise } from "./utils";
import { Context } from "./context";
import { Info } from "./info";
import { QueryTransports, MutationTransports } from "./transports";

export interface Hooks<Source> {
  /**
   * query hooks
   */
  "on-query": <Tr extends keyof QueryTransports>(
    transport: Tr
  ) => (query: Tr, context: Context, info: Info) => MaybePromise<void>;
  "on-query-one": <Tr extends keyof QueryTransports>(
    transport: Tr
  ) => (query: Tr, context: Context, info: Info) => MaybePromise<void>;
  "on-query-many": <Tr extends keyof QueryTransports>(
    transport: Tr
  ) => (query: Tr, context: Context, info: Info) => MaybePromise<void>;
  "on-create": (
    context: Context,
    info: Info
  ) => MaybePromise<
    MutationTransports<Source>["internal-mutation"] | undefined
  >;
  /**
   * mutation hooks
   */
  "on-create-after-data": (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  "on-update": (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<
    MutationTransports<Source>["internal-mutation"] | undefined
  >;
  "on-update-after-data": (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  "on-delete": (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  "on-delete-after-data": (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  "on-mutation": (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<
    MutationTransports<Source>["internal-mutation"] | undefined
  >;
  "on-mutation-after-data": (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
}
