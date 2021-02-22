import { Scalar, Object } from "./type";
import { Upload } from "./scalars";

export const Types = {
  ID: Scalar<string>("ID"),
  Int: Scalar<number>("Int"),
  Float: Scalar<number>("Float"),
  String: Scalar<string>("String"),
  Boolean: Scalar<boolean>("Boolean"),
  Upload: Scalar<Upload>("Upload"),
  Scalar,
  Object,
} as const;
