import { Type, Typed, Types } from "./types";

type Source = { [key: string]: unknown };
type Args = { [key: string]: Type };

export class Service<
  TYPE extends Type,
  ARGS extends Args,
  SOURCE extends Source | undefined = undefined
> {
  #type = Type;

  constructor(type: TYPE, args?: ARGS) {
    this.#type = type;
  }

  resolver(fn: (source: SOURCE, args, context, info) => Typed<TYPE>);
}

new Service(Types.ID).resolver(() => {});
