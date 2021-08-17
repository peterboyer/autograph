export enum SubType {
  SCALAR = "Scalar",
  OBJECT = "Object",
}

export class Type<
  SUBTYPE extends SubType = SubType,
  VALUETYPE = any,
  PROPERTIES extends { LIST?: boolean; NONNULL?: boolean; DEFAULT?: any } = any,
  LIST extends boolean = NonNullable<PROPERTIES["LIST"]>,
  NONNULL extends boolean = NonNullable<PROPERTIES["NONNULL"]>
> {
  __subtype: SUBTYPE;
  __valuetype: VALUETYPE;
  __name: string;
  __list: LIST;
  __nonnull: NONNULL;
  __default: VALUETYPE;

  constructor(name: string, subtype: SUBTYPE, properties?: PROPERTIES) {
    const {
      LIST = false,
      NONNULL = false,
      DEFAULT = undefined,
    } = properties ?? {};

    this.__name = name;
    this.__subtype = subtype;
    this.__valuetype = undefined as unknown as VALUETYPE;
    this.__list = LIST as unknown as LIST;
    this.__nonnull = NONNULL as unknown as NONNULL;
    this.__default = DEFAULT as unknown as VALUETYPE;
  }

  get Item() {
    return new Type<
      SUBTYPE,
      VALUETYPE,
      { LIST: false; NONNULL: NONNULL; DEFAULT: VALUETYPE }
    >(this.__name, this.__subtype, {
      LIST: false,
      NONNULL: this.__nonnull,
      DEFAULT: this.__default,
    });
  }

  get List() {
    return new Type<
      SUBTYPE,
      VALUETYPE,
      { LIST: true; NONNULL: NONNULL; DEFAULT: VALUETYPE }
    >(this.__name, this.__subtype, {
      LIST: true,
      NONNULL: this.__nonnull,
      DEFAULT: this.__default,
    });
  }

  get NonNull() {
    return new Type<
      SUBTYPE,
      VALUETYPE,
      { LIST: LIST; NONNULL: true; DEFAULT: VALUETYPE }
    >(this.__name, this.__subtype, {
      LIST: this.__list,
      NONNULL: true,
      DEFAULT: this.__default,
    });
  }

  get Nullable() {
    return new Type<
      SUBTYPE,
      VALUETYPE,
      { LIST: LIST; NONNULL: false; DEFAULT: VALUETYPE }
    >(this.__name, this.__subtype, {
      LIST: this.__list,
      NONNULL: false,
      DEFAULT: this.__default,
    });
  }

  Default(value: VALUETYPE) {
    return new Type<
      SUBTYPE,
      VALUETYPE,
      { LIST: LIST; NONNULL: NONNULL; DEFAULT: VALUETYPE }
    >(this.__name, this.__subtype, {
      LIST: this.__list,
      NONNULL: this.__nonnull,
      DEFAULT: value,
    });
  }

  toSchemaString() {
    const { __name, __list, __nonnull } = this;
    let schema = __name;
    if (__nonnull) schema = `${schema}!`;
    if (__list) schema = `[${schema}]`;
    return schema;
  }

  static toSchemaValueString(value: any) {
    let schema = value;
    if (typeof value === "string") schema = `"${schema}"`;
    return schema;
  }

  static toSchemaArgsString(args?: Record<string, Type>) {
    if (!args) return "";
    if (!Object.keys(args).length) return "";
    let schema = Object.entries(args)
      .map(([key, type]) => {
        let schema = `${key}: ${type.toSchemaString()}`;
        const { __default } = type;
        if (__default !== undefined)
          schema = `${schema} = ${Type.toSchemaValueString(__default)}`;
        return schema;
      })
      .join(", ");
    schema = `(${schema})`;
    return schema;
  }
}

class ScalarType<VALUETYPE> extends Type<SubType.SCALAR, VALUETYPE> {
  constructor(name: string) {
    super(name, SubType.SCALAR);
  }
}

export { ScalarType as Scalar };

class ObjectType<VALUETYPE> extends Type<SubType.OBJECT, VALUETYPE> {
  constructor(name: string) {
    super(name, SubType.OBJECT);
  }
}

export { ObjectType as Object };
