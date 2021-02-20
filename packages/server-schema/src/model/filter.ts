import { Scalar } from "../types/type";

export type Filter =
  | {
      type: Scalar;
      message: "internal";
      resolver: InternalResolver;
    }
  | {
      type: Scalar;
      message: "adapter";
      resolver: AdapterResolver;
    };

export type InternalResolver = () => {};

export type AdapterResolver = () => {};
