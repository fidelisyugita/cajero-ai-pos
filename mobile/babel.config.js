const unistylesPluginOptions = {
  autoProcessImports: ["@codemask/styles"],
  debug: false,
  root: "app",
};

module.exports = (api) => {
  api.cache(true);
  const isProd = process.env.NODE_ENV === "production";
  const plugins = [
    ["react-native-unistyles/plugin", unistylesPluginOptions],
    ["inline-import", { extensions: [".sql"] }],
    "react-native-reanimated/plugin",
  ];

  if (isProd) {
    plugins.push(["transform-remove-console", { exclude: ["error", "warn"] }]);
  }

  return {
    plugins,
    presets: ["babel-preset-expo"],
  };
};
