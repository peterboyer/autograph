import express from "express";
import { graphqlHTTP } from "express-graphql";

import { Autograph } from "./autograph";
import { Model } from "./model";
import { Field } from "./model";

const autograph = new Autograph();

const user = new Model("User")
  .field(
    "firstParent",
    (t) => t.self,
    (x) => x.get()
  )
  .field("lastParent", () => this)
  .field("parents", () => this.list().nonNullable());

autograph.model(user);
