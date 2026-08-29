import packageJson from "../../package.json";
import {
  AppInfo,
  getAppEnvironment,
  getAppVersion,
  getBuildNumber,
  getFullVersionString,
} from "../AppInfo";

let mockConfig: {
  version?: string;
  android?: { versionCode?: number };
} | null = {
  version: "1.0.7",
  android: {
    versionCode: 42,
  },
};

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return mockConfig;
    },
  },
}));

describe("AppInfo Utility", () => {
  const originalAppEnv = process.env.EXPO_PUBLIC_APP_ENV;
  const originalAppVersion = process.env.EXPO_PUBLIC_APP_VERSION;
  const originalBuildNumber = process.env.EXPO_PUBLIC_BUILD_NUMBER;

  beforeEach(() => {
    mockConfig = {
      version: "1.0.7",
      android: {
        versionCode: 42,
      },
    };
    delete process.env.EXPO_PUBLIC_APP_ENV;
    delete process.env.EXPO_PUBLIC_APP_VERSION;
    delete process.env.EXPO_PUBLIC_BUILD_NUMBER;
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_APP_ENV = originalAppEnv;
    process.env.EXPO_PUBLIC_APP_VERSION = originalAppVersion;
    process.env.EXPO_PUBLIC_BUILD_NUMBER = originalBuildNumber;
  });

  describe("getAppVersion", () => {
    it("returns version from Constants.expoConfig", () => {
      expect(getAppVersion()).toBe("1.0.7");
    });

    it("falls back to EXPO_PUBLIC_APP_VERSION if Constants.expoConfig.version is missing", () => {
      mockConfig = { version: undefined };
      process.env.EXPO_PUBLIC_APP_VERSION = "2.1.0";

      expect(getAppVersion()).toBe("2.1.0");
    });

    it("falls back to package.json version if expoConfig is null", () => {
      mockConfig = null;
      expect(getAppVersion()).toBe(packageJson.version);
    });
  });

  describe("getBuildNumber", () => {
    it("returns versionCode from Constants.expoConfig.android", () => {
      expect(getBuildNumber()).toBe("42");
    });

    it("falls back to EXPO_PUBLIC_BUILD_NUMBER if versionCode is not present", () => {
      mockConfig = { version: "1.0.7" };
      process.env.EXPO_PUBLIC_BUILD_NUMBER = "99";

      expect(getBuildNumber()).toBe("99");
    });

    it("defaults to 1 if neither versionCode nor build env is set", () => {
      mockConfig = { version: "1.0.7" };
      expect(getBuildNumber()).toBe("1");
    });
  });

  describe("getAppEnvironment", () => {
    it("returns EXPO_PUBLIC_APP_ENV if set to valid environment", () => {
      process.env.EXPO_PUBLIC_APP_ENV = "staging";
      expect(getAppEnvironment()).toBe("staging");

      process.env.EXPO_PUBLIC_APP_ENV = "production";
      expect(getAppEnvironment()).toBe("production");

      process.env.EXPO_PUBLIC_APP_ENV = "development";
      expect(getAppEnvironment()).toBe("development");
    });

    it("defaults based on __DEV__ flag when EXPO_PUBLIC_APP_ENV is unset", () => {
      delete process.env.EXPO_PUBLIC_APP_ENV;
      expect(getAppEnvironment()).toBe("development");
    });
  });

  describe("getFullVersionString", () => {
    it("returns plain version when includeBuildNumber is false", () => {
      expect(getFullVersionString(false)).toBe("1.0.7");
    });

    it("returns formatted version with build number when includeBuildNumber is true", () => {
      expect(getFullVersionString(true)).toBe("v1.0.7 (Build 42)");
    });
  });

  describe("AppInfo default export", () => {
    it("contains all helper functions", () => {
      expect(AppInfo.getAppVersion).toBeDefined();
      expect(AppInfo.getBuildNumber).toBeDefined();
      expect(AppInfo.getAppEnvironment).toBeDefined();
      expect(AppInfo.getFullVersionString).toBeDefined();
    });
  });
});
