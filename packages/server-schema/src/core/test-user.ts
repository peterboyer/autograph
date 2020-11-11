import Parser from "./parser/parser";
const parser = Parser();

import { Types as BaseTypes, Complex } from "./types/types-types";
const Types = Object.assign({}, BaseTypes, {
  User: Complex("User"),
});

export type TUser = {
  id: number;
  name: string | null;
};

export const User = parser<TUser>({
  name: "User",
  fields: {
    id: Types.NoNull(Types.ID),
    name: Types.String,
    friend: {
      type: Types.User,
      resolver: {
        get: ({ args }) =>
          args({
            id: Types.NoNull(Types.ID),
            aux: Types.String,
          })((source, args) => {
            console.log(args.id);
          }),
      },
    },
  },
});
