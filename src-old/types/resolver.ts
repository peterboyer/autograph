import { MaybePromise } from "./utils";
import { Context } from "./context";
import { Info } from "./info";

export type Resolver<
  Source extends any = any,
  Args extends Record<string, any> = any,
  Return extends any = any
> = (
  source: Source,
  args: Args,
  context: Context,
  info: Info
) => MaybePromise<Return>;
