import type { ConfigContext, ExpoConfig } from "expo/config";
import packageJson from "./package.json";

/**
 * Dynamic Expo Configuration
 * Centralizes marketing version from package.json into ExpoConfig and extra runtime metadata.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "Cajero",
  slug: config.slug ?? "cajero",
  version: packageJson.version,
  extra: {
    ...config.extra,
    version: packageJson.version,
    appVersion: packageJson.version,
  },
});
