import jwt, { SignOptions } from "jsonwebtoken";

import { env } from "../../../config/env";
import { AuthenticatedUser } from "../auth.types";

type JwtPayload = {
  sub: string;
  email: string;
};

export const generateAccessToken = (user: AuthenticatedUser): string => {
  const payload: JwtPayload = {
    sub: String(user.id),
    email: user.email
  };

  const signOptions: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.jwt.secret, signOptions);
};
