import Knex from "knex";
import { MaybePromise } from "../types/utils";
import { AutographError } from "../errors";
import { AuthMiddleware } from "./auth-middleware";

type Options<User, Assoc, UserID> = {
  getAssoc: (token: string) => MaybePromise<Assoc>;
  getAssocUserId: (assoc: Assoc) => UserID;
  getUser: (userId: UserID) => MaybePromise<User>;
  tokenLife: number;
  transformToken?: (token: string) => string;
  transformDevUserId?: (id: string) => UserID;
  testAssocExpired: (assoc: Assoc, life: number) => MaybePromise<boolean>;
};

type KnexOptions<User, Assoc> = {
  userTable: string;
  assocTable: string;
  assocTableTokenKey: string;
} & Omit<Options<User, Assoc, number>, "getAssoc" | "getUser">;

type AuthMiddlewareReturn<User, UserID> = Pick<
  AuthMiddleware<User, UserID>["options"],
  "getUserIdFromToken" | "getUser" | "getUserIdFromDevToken"
>;

interface Strategy {
  <User, Assoc>(
    options: Options<User, Assoc, string | number>
  ): AuthMiddlewareReturn<User, any>;
  useKnex: <User, Assoc>(
    knex: Knex,
    options: KnexOptions<User, Assoc>
  ) => AuthMiddlewareReturn<User, number>;
}

export const AuthUserAssocStrategy: Strategy = (options) => {
  return {
    getUserIdFromToken: async (token) => {
      const assoc = await options.getAssoc(
        options.transformToken ? options.transformToken(token) : token
      );
      const isExpired = await options.testAssocExpired(
        assoc,
        options.tokenLife
      );
      if (isExpired) {
        throw new AutographError("TOKEN_EXPIRED");
      }
      const userId = options.getAssocUserId(assoc);
      return userId;
    },
    getUser: async (userId) => {
      const user = await options.getUser(userId);
      return user;
    },
    getUserIdFromDevToken: options.transformDevUserId || ((id) => id),
  };
};

AuthUserAssocStrategy.useKnex = (knex, options) => {
  const { userTable, assocTable, assocTableTokenKey, ...forward } = options;
  return AuthUserAssocStrategy({
    ...forward,
    getAssoc: (token) =>
      knex(assocTable)
        .where({
          [assocTableTokenKey]: token,
        })
        .first(),
    getUser: (userId) => knex(userTable).where({ id: userId }).first(),
    transformDevUserId: (id) => parseInt(id),
  });
};
