export class AutographError extends Error {
  data: any;
  constructor(code: string, data?: any) {
    super(code);
    if (data && typeof data === "object") {
      const nextData = { ...data };
      Object.entries(nextData).forEach(([key, value]) => {
        if (value instanceof AutographError) {
          nextData[key] = {
            code: value.message,
            data: value.data,
          };
        }
      });
      this.data = nextData;
    } else {
      this.data = data;
    }
  }
}

export const die = (code: string, data?: any) => {
  // @ts-ignore
  return new AutographError(code, data);
};
