import Constants from "expo-constants";
import packageJson from "../package.json";

export type AppEnvironment = "development" | "staging" | "production";

/**
 * Returns the current application marketing version (SemVer, e.g. "1.0.7").
 */
export const getAppVersion = (): string => {
  return (
    Constants.expoConfig?.version ??
    process.env.EXPO_PUBLIC_APP_VERSION ??
    packageJson.version ??
    "1.0.0"
  );
};

/**
 * Returns the native build number or Android versionCode (e.g. "1").
 */
export const getBuildNumber = (): string => {
  const versionCode = Constants.expoConfig?.android?.versionCode;
  if (versionCode !== undefined && versionCode !== null) {
    return String(versionCode);
  }
  return process.env.EXPO_PUBLIC_BUILD_NUMBER ?? "1";
};

/**
 * Returns the active runtime environment.
 */
export const getAppEnvironment = (): AppEnvironment => {
  const env = process.env.EXPO_PUBLIC_APP_ENV?.trim().toLowerCase();
  if (env === "production" || env === "staging" || env === "development") {
    return env as AppEnvironment;
  }
  return __DEV__ ? "development" : "production";
};

/**
 * Returns a formatted version string for display in UI or diagnostic logs.
 * @example getFullVersionString() => "1.0.7"
 * @example getFullVersionString(true) => "v1.0.7 (Build 1)"
 */
export const getFullVersionString = (includeBuildNumber = false): string => {
  const version = getAppVersion();
  if (includeBuildNumber) {
    const build = getBuildNumber();
    return `v${version} (Build ${build})`;
  }
  return version;
};

export const AppInfo = {
  getAppVersion,
  getBuildNumber,
  getAppEnvironment,
  getFullVersionString,
};

export default AppInfo;
