import Reactotron from "reactotron-react-native";

// biome-ignore lint/correctness/useHookAtTopLevel: Reactotron plugin configuration, not a React hook
Reactotron.configure({
	name: "Cajero",
})
	.useReactNative()
	.connect();

declare global {
	interface Console {
		tron: typeof Reactotron;
	}
}

console.tron = Reactotron;

export default Reactotron;
