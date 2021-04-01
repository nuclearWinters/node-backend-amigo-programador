import { Context } from "./types";

declare global {
  namespace Express {
    interface Application {
      context: Context;
    }
    interface Request {
      _id?: string;
      accessToken?: string;
    }
  }
}
