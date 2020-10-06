export const types = {
  ID: "ID",
  INTEGER: "INTEGER",
  TEXT: "TEXT",
  STRING: "STRING",
  BOOLEAN: "BOOLEAN",
  TIME: "TIME",
  DATETIME: "DATETIME",
  DATE: "DATE",
  TIMESTAMP: "TIMESTAMP",
  JSON: "JSON",
  UUID: "UUID",
} as const;

export type Types = typeof types;

type TNull<T, B> = B extends {
  nullable: false;
}
  ? T
  : T | null;

export type Typed<
  T extends {
    [key: string]:
      | { type: keyof Types }
      | ((...args: any[]) => { type: keyof Types });
  }
> = {
  [K in keyof T]: T[K] extends false
    ? never
    : T[K] extends (...args: any[]) => {}
    ? Typed<ReturnType<T[K]>>
    : T[K] extends { type: Types["ID"] }
    ? TNull<number, T[K]>
    : T[K] extends { type: Types["INTEGER"] }
    ? TNull<number, T[K]>
    : T[K] extends { type: Types["TEXT"] }
    ? TNull<string, T[K]>
    : T[K] extends { type: Types["STRING"] }
    ? TNull<string, T[K]>
    : T[K] extends { type: Types["BOOLEAN"] }
    ? TNull<boolean, T[K]>
    : T[K] extends { type: Types["TIME"] }
    ? TNull<Date, T[K]>
    : T[K] extends { type: Types["DATETIME"] }
    ? TNull<Date, T[K]>
    : T[K] extends { type: Types["DATE"] }
    ? TNull<Date, T[K]>
    : T[K] extends { type: Types["TIMESTAMP"] }
    ? TNull<Date, T[K]>
    : T[K] extends { type: Types["JSON"] }
    ? TNull<string, T[K]>
    : T[K] extends { type: Types["UUID"] }
    ? TNull<string, T[K]>
    : K extends "id"
    ? number
    : K extends "created_at"
    ? Date
    : K extends "updated_at"
    ? Date
    : never;
};
