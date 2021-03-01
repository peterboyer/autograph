export class AutographError extends Error {
  data: any;
  constructor(code: string, data?: any) {
    super(code);
    this.data = data;
  }
}

export const die = (code: string, data?: any) => {
  // @ts-ignore
  return new AutographError(code, data);
};
