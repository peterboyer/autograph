export class Field<T> {
  #name: string;
  #type: string;

  constructor(name: string, type: string) {
    this.#type = type;
  }


}

export const Types = {
  self: "self",
  Int: "Int",
  Float: "Float",
  String: "String",
  Boolean: "Boolean",
  ID: "ID",
};

export class Model<NAME extends string> {
  #name: string;
  #fields: Map<string, Field>;

  constructor(name: NAME) {
    this.#name = name;
    this.#fields = new Map();
  }

  field<T>(
    fieldName: string,
    typeFn: (t: typeof Types) => T,
    optsFn: (x: Field<T>) => ,
  ) {
    this.#fields.set(fieldName, new Field(typeFn(Types)));
    return this;
  }
}
