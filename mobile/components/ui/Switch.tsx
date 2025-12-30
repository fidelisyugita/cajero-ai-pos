import { TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { vs } from "@/utils/Scale";

interface SwitchProps {
	value: boolean;
	onValueChange: (value: boolean) => void;
	disabled?: boolean;
}

const Switch = ({ value, onValueChange, disabled }: SwitchProps) => {
	$.useVariants({ active: value, disabled });
	return (
		<TouchableOpacity
			activeOpacity={0.8}
			onPress={() => onValueChange(!value)}
			style={$.track}
			disabled={disabled}
		>
			<Animated.View style={$.thumb(value)} />
		</TouchableOpacity>
	);
};

const $ = StyleSheet.create((theme) => ({
	track: {
		width: vs(50),
		height: vs(24),
		borderRadius: vs(50),
		justifyContent: "center",
		padding: vs(2),
		backgroundColor: theme.colors.neutral[300],
		variants: {
			active: {
				true: {
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
	thumb: (animate: boolean) => ({
		width: vs(20),
		height: vs(20),
		borderRadius: theme.radius.full,
		backgroundColor: theme.colors.neutral[100],
		//shadow
		shadowColor: "#000000",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.08,
		shadowRadius: vs(4),
		elevation: 4,
		zIndex: 2,
		// animate
		transform: [{ translateX: animate ? vs(26) : 0 }],
		transitionProperty: "transform",
		transitionDuration: "200ms",
		transitionTimingFunction: "linear",
		//variants
		variants: {
			active: {
				true: {
					backgroundColor: theme.colors.primary[400],
				},
			},
		},
	}),
}));

export default Switch;
