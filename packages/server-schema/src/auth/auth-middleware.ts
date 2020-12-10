import http from "http";

export type TOptions<User, UserToken> = {
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
    resolveHeader: NonNullable<TOptions<User, UserToken>["resolveHeader"]>;
    resolveToken: TOptions<User, UserToken>["resolveToken"];
    resolveUser: TOptions<User, UserToken>["resolveUser"];
    predicate: TOptions<User, UserToken>["predicate"];
    onSuccess: TOptions<User, UserToken>["onSuccess"];
    onResolveError: TOptions<User, UserToken>["onResolveError"];
    onPredicateError: TOptions<User, UserToken>["onPredicateError"];
  };

  constructor(options: TOptions<User, UserToken>) {
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
    return await this.options.resolveUser(token);
  }

  async resolve(req: http.RequestOptions) {
    const raw = this.onRequest(req);
    const token = (await this.onRaw(raw)) || undefined;
    const user = (token && (await this.onToken(token))) || undefined;

    return { user, token };
  }
}

export default AuthMiddleware;
