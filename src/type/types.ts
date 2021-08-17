import { Type, Scalar, Object } from "./type";

export { Type, Scalar as Scalar, Object as Object };

export const ID = new Scalar<string>("ID");

export const Int = new Scalar<number>("Int");

export const Float = new Scalar<number>("Float");

export const String = new Scalar<string>("String");

export const Boolean = new Scalar<boolean>("Boolean");

// export const Upload = new Scalar<Upload>("Upload");
