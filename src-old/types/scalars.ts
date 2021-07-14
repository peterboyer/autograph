import { WriteStream } from "fs-capacitor";

/**
 * Referenced from:
 * https://github.com/jaydenseric/graphql-upload/blob/1398e62a53ad8075d6d4fc0692e326ceef224ca0/public/processRequest.js#L302
 * https://github.com/mike-marcacci/fs-capacitor
 */
export type Upload = Promise<{
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: WriteStream["createReadStream"];
}>;
