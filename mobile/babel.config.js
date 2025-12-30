const unistylesPluginOptions = {
	autoProcessImports: ["@codemask/styles"],
	debug: false,
	root: "app",
};

module.exports = (api) => {
	api.cache(true);
	return {
		plugins: [
			["react-native-unistyles/plugin", unistylesPluginOptions],
			["inline-import", { extensions: [".sql"] }],
			"react-native-worklets/plugin",
		],
		presets: ["babel-preset-expo"],
	};
};
