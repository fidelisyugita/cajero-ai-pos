import Reactotron from "reactotron-react-native";

// biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
Reactotron.configure({
	name: "Cajero",
})
	.useReactNative()
	.connect();

// Optional: log Reactotron connection
console.log("Reactotron Configured");

// Extend the global console type to include 'tron'
declare global {
	interface Console {
		tron: typeof Reactotron;
	}
}

console.tron = Reactotron;

export default Reactotron;
