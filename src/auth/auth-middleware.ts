import http from "http";
import { Optional } from "../types/utils";
import { AutographError } from "../errors";

export class AuthMiddleware<User, UserID = any> {
  options: {
    devToken?: boolean;
    getHeader: (req: http.RequestOptions) => string | undefined;
    getUserIdFromToken: (token: string) => Promise<UserID | undefined>;
    getUserIdFromDevToken: (id: string) => UserID | undefined;
    getUser: (userId: UserID) => Promise<User>;
  };

  constructor(
    options: Optional<AuthMiddleware<User, UserID>["options"], "getHeader">
  ) {
    this.options = {
      getHeader:
        options.getHeader ||
        ((req) => {
          const header = req?.headers?.authorization;
          if (!header) return;
          if (Array.isArray(header)) return;
          if (typeof header === "number") return;
          return header;
        }),
      ...options,
    };
  }

  getTokenFromRequest(req: http.RequestOptions) {
    const header = this.options.getHeader(req);

    if (!header) return;
    const headerMatch = header.match(/^Bearer (.+)$/);

    if (!headerMatch) return;
    const [, raw] = headerMatch;

    return raw;
  }

  getUserIdFromToken(token: string) {
    const devtoken = token.match(/^devtoken:(\d+)$/);
    if (devtoken) {
      return this.options.getUserIdFromDevToken(devtoken[1]);
    }
    return this.options.getUserIdFromToken(token);
  }

  async getUserFromToken(token: string | undefined) {
    if (!token) {
      return;
    }

    const userId = await this.getUserIdFromToken(token);
    if (!userId) {
      throw new AutographError("TOKEN_INVALID");
    }

    const user = await this.options.getUser(userId);
    if (!user) {
      throw new AutographError("TOKEN_INVALID_USER");
    }

    return user;
  }

  async resolve(req: http.RequestOptions) {
    const token = this.getTokenFromRequest(req);
    const user = await this.getUserFromToken(token);
    return user;
  }
}
