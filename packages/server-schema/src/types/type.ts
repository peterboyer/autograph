import omit from "lodash.omit";
import { Sources } from "./sources";

export type Is = "scalar" | "object";

// constructor
export const Type = <I extends Is, V>(_is: I, name: string) => {
  const self = {
    _is,
    _type: (undefined as unknown) as V,
    name,
    isList: false,
    isNonNull: false,
    get List(): {
      _is: typeof self["_is"];
      _type: typeof self["_type"];
      name: typeof self["name"];
      isList: true;
      isNonNull: typeof self["isNonNull"];
      NonNull: {
        _is: typeof self["_is"];
        _type: typeof self["_type"];
        name: typeof self["name"];
        isList: true;
        isNonNull: true;
      };
    } {
      return {
        ...omit(self, ["List", "NonNull"]),
        isList: true,
        get NonNull(): {
          _is: typeof self["_is"];
          _type: typeof self["_type"];
          name: typeof self["name"];
          isList: true;
          isNonNull: true;
        } {
          return {
            ...omit(self, ["List", "NonNull"]),
            isList: true,
            isNonNull: true,
          };
        },
      };
    },
    get NonNull(): {
      _is: typeof self["_is"];
      _type: typeof self["_type"];
      name: typeof self["name"];
      isList: typeof self["isList"];
      isNonNull: true;
    } {
      return {
        ...omit(self, ["List", "NonNull"]),
        isNonNull: true,
      };
    },
  };

  return Object.freeze(self);
};

export type Type<T = Is, V = unknown> = Readonly<{
  _is: T;
  _type: V;
  name: string;
  isNonNull: boolean;
  isList: boolean;
}>;

type _Scalar<V = unknown> = Type<"scalar", V>;
const _Scalar = <V>(name: string) => Type<"scalar", V>("scalar", name);
export { _Scalar as Scalar };

type _Object<V = unknown> = Type<"scalar", V>;
const _Object = <
  N extends string | Ns,
  Ns extends Exclude<keyof Sources, number | symbol>
>(
  name: N
) => Type<"object", N extends Ns ? Sources[N] : any>("object", name);
export { _Object as Object };
