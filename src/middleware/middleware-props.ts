import { ValueTypedRecord } from "../type";
import { MiddlewareArgs } from "./middleware-args";

interface Options {
  Parent?: any;
  Args?: any;
  Context?: any;
  Info?: any;
}

export { Options as MiddlewarePropsOptions };

export interface MiddlewareProps<
  OPTIONS extends Options = {},
  PARENT extends any = OPTIONS["Parent"],
  ARGS extends MiddlewareArgs = OPTIONS["Args"],
  CONTEXT extends any = OPTIONS["Context"],
  INFO extends any = OPTIONS["Info"]
> {
  parent: PARENT;
  args: ValueTypedRecord<ARGS>;
  context: CONTEXT;
  info: INFO;
}
