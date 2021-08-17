import { Context } from "./context";
import { buildService } from "../service";

export const Service = buildService<{ Context: Context }>();
