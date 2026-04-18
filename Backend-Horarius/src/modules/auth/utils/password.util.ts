import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);
const HASH_PREFIX = "scrypt";
const KEY_LENGTH = 64;

export const isPasswordHashed = (value: string): boolean => value.startsWith(`${HASH_PREFIX}$`);

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return `${HASH_PREFIX}$${salt}$${derivedKey.toString("hex")}`;
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  if (!isPasswordHashed(hashedPassword)) {
    return false;
  }

  const [, salt, storedHash] = hashedPassword.split("$");

  if (!salt || !storedHash) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  const storedKey = Buffer.from(storedHash, "hex");

  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedKey, derivedKey);
};
