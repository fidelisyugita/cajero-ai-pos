const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const SHIMS = {
  lodash: path.resolve(__dirname, "shims/lodash.js"),
  "expo-symbols": path.resolve(__dirname, "shims/expo-symbols.js"),
  "tailwind-merge": path.resolve(__dirname, "shims/tailwind-merge.js"),
};

const SENTRY_BROWSER_DEAD_MODULES = [
  "featureFlags",
  "webWorker",
  "diagnose-sdk",
  "profiling",
  "reportingobserver",
  "graphqlClient",
  "spotlight",
  "httpclient",
  "contextlines",
  "browsersession",
  "transports/offline",
];

function getSentryBrowserShim(moduleName) {
  if (moduleName === "./report-dialog.js" || moduleName === "./report-dialog") {
    return path.resolve(__dirname, "shims/sentry-report-dialog.js");
  }
  if (SENTRY_BROWSER_DEAD_MODULES.some((token) => moduleName.includes(token))) {
    return path.resolve(__dirname, "shims/sentry-noop.js");
  }
  return null;
}

function getCustomShim(moduleName, originModulePath) {
  if (SHIMS[moduleName]) {
    return SHIMS[moduleName];
  }
  if (moduleName === "@expo/ui" || moduleName.startsWith("@expo/ui/")) {
    return path.resolve(__dirname, "shims/expo-ui.js");
  }
  if (moduleName === "@sentry-internal/replay" || moduleName === "@sentry-internal/replay-canvas") {
    return path.resolve(__dirname, "shims/sentry-replay.js");
  }
  if (moduleName === "@sentry-internal/feedback") {
    return path.resolve(__dirname, "shims/sentry-feedback.js");
  }
  if (originModulePath?.includes("@sentry/browser")) {
    return getSentryBrowserShim(moduleName);
  }
  return null;
}

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { resolver, transformer } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
    minifierConfig: {
      ...transformer.minifierConfig,
      compress: {
        ...transformer.minifierConfig?.compress,
        passes: 2,
        dead_code: true,
        drop_debugger: true,
        conditionals: true,
        evaluate: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
        collapse_vars: true,
        reduce_vars: true,
      },
    },
  };

  const defaultResolveRequest = resolver.resolveRequest;

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg", "sql"],
    resolveRequest: (context, moduleName, platform) => {
      const shimPath = getCustomShim(moduleName, context.originModulePath);
      if (shimPath) {
        return {
          filePath: shimPath,
          type: "sourceFile",
        };
      }
      if (defaultResolveRequest) {
        return defaultResolveRequest(context, moduleName, platform);
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  };

  return config;
})();
