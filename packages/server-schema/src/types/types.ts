import { Scalar, Object } from "./type";

export const Types = {
  ID: Scalar<string>("ID"),
  Int: Scalar<number>("Int"),
  Float: Scalar<number>("Float"),
  String: Scalar<string>("String"),
  Boolean: Scalar<boolean>("Boolean"),
  Scalar,
  Object,
} as const;
