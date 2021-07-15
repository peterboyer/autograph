export enum SubType {
  SCALAR = "scalar",
  OBJECT = "object",
}

export class Type<
  SUBTYPE extends SubType = SubType,
  VALUETYPE = any,
  LIST = boolean,
  NONNULL = boolean
> {
  __subtype: SUBTYPE;
  __valuetype: VALUETYPE;
  __name: string;
  __list: LIST;
  __nonnull: NONNULL;

  constructor(name: string, subtype: SUBTYPE, list?: LIST, nonnull?: NONNULL) {
    this.__name = name;
    this.__subtype = subtype;
    this.__valuetype = undefined as unknown as VALUETYPE;
    this.__list = list as unknown as LIST;
    this.__nonnull = nonnull as unknown as NONNULL;
  }

  get Item(): Type<SUBTYPE, VALUETYPE, false, NONNULL> {
    return new Type<SUBTYPE, VALUETYPE, false, NONNULL>(
      this.__name,
      this.__subtype,
      false,
      this.__nonnull
    );
  }

  get List(): Type<SUBTYPE, VALUETYPE, true, NONNULL> {
    return new Type<SUBTYPE, VALUETYPE, true, NONNULL>(
      this.__name,
      this.__subtype,
      true,
      this.__nonnull
    );
  }

  get NonNull(): Type<SUBTYPE, VALUETYPE, LIST, true> {
    return new Type<SUBTYPE, VALUETYPE, LIST, true>(
      this.__name,
      this.__subtype,
      this.__list,
      true
    );
  }

  get Nullable(): Type<SUBTYPE, VALUETYPE, LIST, false> {
    return new Type<SUBTYPE, VALUETYPE, LIST, false>(
      this.__name,
      this.__subtype,
      this.__list,
      false
    );
  }
}

export class Scalar<VALUETYPE> extends Type<SubType.SCALAR, VALUETYPE> {
  constructor(name: string) {
    super(name, SubType.SCALAR);
  }
}

export class Object<VALUETYPE> extends Type<SubType.OBJECT, VALUETYPE> {
  constructor(name: string) {
    super(name, SubType.OBJECT);
  }
}
