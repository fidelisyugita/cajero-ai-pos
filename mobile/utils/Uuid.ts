import * as Crypto from "expo-crypto";

export const generateUUID = (): string => {
  return Crypto.randomUUID();
};
