import { Type, ValueTyped } from "../type";
import {
  MiddlewareProps as MiddlewareProps,
  MiddlewarePropsOptions as MiddlewarePropsOptions,
} from "./middleware-props";

export type MiddlewareNext = () => void;

interface Options extends MiddlewarePropsOptions {
  Returns?: any;
  Next?: any;
}

export { Options as MiddlewareOptions };

export interface Middleware<
  OPTIONS extends Options = any,
  RETURNS extends Type = OPTIONS["Returns"],
  NEXT extends MiddlewareNext = OPTIONS["Next"]
> {
  (props: MiddlewareProps<OPTIONS>, next: NEXT): ValueTyped<RETURNS>;
}
