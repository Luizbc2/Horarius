import { AccessTokenPayload } from "../../modules/auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      auth?: AccessTokenPayload;
    }
  }
}

export {};
