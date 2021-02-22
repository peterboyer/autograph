import { Model } from "./model/model";
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

const Place = new Model("Place", {
  queryMany: false,
  mutationDelete: false,
})
  .field("name", Types.String.NonNull, ({ get, set }) => ({
    get: get((source) => {
      return source.name;
    }),
    set: set((value, source) => {
      return {
        name: value,
      };
    }),
    setCreate: set.create((value, context, info) => {
      return {
        name: value,
      };
    }),
    setUpdate: set.update.with(Types.Int.NonNull)((value, source) => {
      return {
        name: value.toString(),
      };
    }),
  }))
  .field("position", Types.String.NonNull, ({ get, set }) => ({
    get: get((source) => {
      return source.position + "_something_more";
    }),
    set: null,
    setUpdate: set.update(async (value) => {
      return {
        position: value + new Date().toISOString(),
      };
    }),
  }))
  .filter("foobar", Types.Int, "query", (value, query) => {
    query.id = "1";
  })
  .hook("on-query", (query, context, info) => {});
