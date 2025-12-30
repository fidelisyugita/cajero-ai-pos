import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { vs } from "@/utils/Scale";

interface RadioButtonProps {
	checked: boolean;
	onPress?: () => void;
	disabled?: boolean;
}

const RadioButton = ({ checked, onPress, disabled }: RadioButtonProps) => {
	const scale = useSharedValue(checked ? 1 : 0);

	useEffect(() => {
		scale.value = withSpring(checked ? 1 : 0, { damping: 60 });
	}, [checked, scale]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		opacity: scale.value,
	}));

	$.useVariants({ checked, disabled });

	return (
		<TouchableOpacity
			accessibilityRole="radio"
			accessibilityState={{ checked, disabled }}
			onPress={onPress}
			disabled={disabled}
			style={$.outer}
			activeOpacity={0.8}
		>
			<Animated.View style={[$.inner, animatedStyle]} />
		</TouchableOpacity>
	);
};

const $ = StyleSheet.create((theme) => ({
	outer: {
		borderWidth: vs(1),
		borderRadius: theme.radius.full,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.colors.neutral[200],
		width: vs(24),
		height: vs(24),
		borderColor: theme.colors.neutral[400],
		variants: {
			checked: {
				true: {
					borderColor: theme.colors.primary[300],
					backgroundColor: theme.colors.primary[100],
				},
			},
			disabled: {
				true: {
					opacity: 0.5,
				},
			},
		},
	},
	inner: {
		borderRadius: theme.radius.full,
		backgroundColor: theme.colors.primary[400],
		width: vs(8),
		height: vs(8),
		// variants for inner are not really needed as it's just a dot that scales
	},
}));

export default RadioButton;
