import * as SecureStore from "expo-secure-store";
import { createMMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

const MMKV_ENCRYPTION_KEY_ALIAS = "cajero_mmkv_key";

function getOrCreateEncryptionKey(): string {
  let key = SecureStore.getItem(MMKV_ENCRYPTION_KEY_ALIAS);
  if (!key) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    key = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    SecureStore.setItem(MMKV_ENCRYPTION_KEY_ALIAS, key);
  }
  return key;
}

const encryptionKey = getOrCreateEncryptionKey();

export function createEncryptedMMKV(id: string) {
  const mmkv = createMMKV({ id, encryptionKey });
  return {
    getItem: (name: string) => {
      const value = mmkv.getString(name);
      return value ?? null;
    },
    setItem: (name: string, value: string) => {
      mmkv.set(name, value);
    },
    removeItem: (name: string) => {
      mmkv.remove(name);
    },
    clearAll: () => {
      mmkv.clearAll();
    },
  };
}

const defaultStorage = createMMKV({ id: "cajero-default-storage", encryptionKey });

const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return defaultStorage.set(name, value);
  },
  getItem: (name) => {
    const value = defaultStorage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return defaultStorage.remove(name);
  },
};

export const clearAllStorage = () => {
  defaultStorage.clearAll();
};

export default zustandStorage;
