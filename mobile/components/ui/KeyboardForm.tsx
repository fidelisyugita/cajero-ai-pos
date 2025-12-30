import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	type ScrollViewProps,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface KeyboardFormProps extends ScrollViewProps { }

const KeyboardForm = ({
	children,
	style,
	contentContainerStyle,
	...rest
}: KeyboardFormProps) => {
	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={[$.container, style]}
		>
			<ScrollView
				automaticallyAdjustKeyboardInsets
				contentContainerStyle={[$.content, contentContainerStyle]}
				keyboardShouldPersistTaps="handled"
				{...rest}
			>
				{children}
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

const $ = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flexGrow: 1,
	},
});

export default KeyboardForm;
