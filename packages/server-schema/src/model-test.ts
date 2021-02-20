import { Model } from "./model";
import { Types } from "./types/types";

declare module "./types/sources" {
  interface Sources {
    User: {
      id: string;
      name: string;
      surname: string | null;
      birthdate: Date | null;
    };
    Place: {
      id: string;
      ref: string | null;
      name: string;
      position: string;
    };
  }
}

const User = new Model("User").field("id", Types.String.NonNull, ({ get }) => ({
  get: get.with({ foo: Types.Int })((source, args) => {
    args.foo;
    return source.id;
  }),
  // get: {
  //   resolver: (source, args, context) => {
  //     return source.id
  //   },
  //   args: {},
  // }
}));

const Place = new Model("Place").field(
  "name",
  Types.String.NonNull,
  ({ get, set }) => ({
    get: get((source) => source.position),
    set: set((value) => ({ name: value })),
  })
);
