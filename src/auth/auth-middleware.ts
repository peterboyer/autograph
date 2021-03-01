import http from "http";

export type Options<User, UserToken> = {
  resolveHeader?: (req: http.RequestOptions) => string | undefined;
  resolveToken: (raw: string) => Promise<UserToken | undefined>;
  resolveUser: (token: UserToken) => Promise<User | undefined>;
  predicate?: (token: UserToken) => Promise<boolean> | boolean;
  onSuccess?: (token: UserToken) => Promise<void>;
  onResolveError?: () => Promise<void>;
  onPredicateError?: (token: UserToken) => Promise<void>;
};

export class AuthMiddleware<User, UserToken> {
  options: {
    resolveHeader: NonNullable<Options<User, UserToken>["resolveHeader"]>;
    resolveToken: Options<User, UserToken>["resolveToken"];
    resolveUser: Options<User, UserToken>["resolveUser"];
    predicate: Options<User, UserToken>["predicate"];
    onSuccess: Options<User, UserToken>["onSuccess"];
    onResolveError: Options<User, UserToken>["onResolveError"];
    onPredicateError: Options<User, UserToken>["onPredicateError"];
  };

  constructor(options: Options<User, UserToken>) {
    this.options = {
      resolveHeader:
        options.resolveHeader ||
        ((req) => {
          const header = req?.headers?.authorization;
          if (!header) return;
          if (Array.isArray(header)) return;
          if (typeof header === "number") return;
          return header;
        }),
      resolveToken: options.resolveToken,
      resolveUser: options.resolveUser,
      predicate: options.predicate,
      onSuccess: options.onSuccess,
      onResolveError:
        options.onResolveError ||
        (() => {
          throw new Error("AUTH_RESOLVE_ERROR");
        }),
      onPredicateError:
        options.onPredicateError ||
        (() => {
          throw new Error("AUTH_PREDICATE_ERROR");
        }),
    };
  }

  onRequest(req: http.RequestOptions): string | undefined {
    const header = this.options.resolveHeader(req);

    if (!header) return;
    const headerMatch = header.match(/^Bearer (.*)$/);

    if (!headerMatch) return;
    const [, raw] = headerMatch;

    return raw;
  }

  async onRaw(raw?: string): Promise<UserToken | undefined> {
    if (!raw) {
      return;
    }

    const token = await this.options.resolveToken(raw);

    if (!token) {
      this.options.onResolveError && (await this.options.onResolveError());
      return;
    }

    if (this.options.predicate) {
      if (!(await this.options.predicate(token))) {
        this.options.onPredicateError &&
          (await this.options.onPredicateError(token));
      }
    }

    this.options.onSuccess && (await this.options.onSuccess(token));

    return token;
  }

  async onToken(token: UserToken) {
    const user = await this.options.resolveUser(token);

    if (!user) {
      this.options.onResolveError && (await this.options.onResolveError());
      return;
    }

    return user;
  }

  async resolve(req: http.RequestOptions) {
    const raw = this.onRequest(req);
    const token = (await this.onRaw(raw)) || undefined;
    const user = (token && (await this.onToken(token))) || undefined;

    return { user, token };
  }
}

export default AuthMiddleware;
