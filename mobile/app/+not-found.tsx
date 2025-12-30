import { Stack } from "expo-router";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const NotFoundScreen = () => {
	return (
		<>
			<Stack.Screen options={{ title: "Oops!" }} />
			<View style={$.container}>
				<Text>not found</Text>
			</View>
		</>
	);
};

const $ = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default NotFoundScreen;
