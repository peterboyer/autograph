import test from "tape";

const clean = (source: string) => source.replace(/[\s\n]+/g, " ").trim();

import Parser from "../graph/graph-source-parser";
import { Types as BaseTypes, Complex } from "../graph/field-types";

const Types = Object.assign({}, BaseTypes, {
  User: Complex("User"),
});

const parser = Parser();

type TUser = {
  id: number;
  name: string | null;
};

export const User = parser<TUser>({
  name: "User",
  fields: {
    id: Types.NoNull(Types.ID),
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
}).compile();

test("typeDefs", (t) => {
  t.test("Root", (t) => {
    const tdroot = clean(User.typeDefs.Root);
    console.log(tdroot);

    t.assert(
      tdroot.match(/type User {[^}]*([^(]id: ID![^)]).*}/),
      "id field correctly defined"
    );

    t.assert(
      tdroot.match(
        /type User {[^}]*(friend\(id: ID! aux: String\): User[^!]).*}/
      ),
      "friend field correctly defined with args"
    );

    t.end();
  });

  t.end();
});
