import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import Animated, {
	useAnimatedProps,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { vs } from "@/utils/Scale";

interface CheckboxProps {
	checked?: boolean;
	onPress: () => void;
	disabled?: boolean;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECKMARK_LENGTH = 28;

// Create a component that accepts style prop from Unistyles
const AnimatedButton = Animated.createAnimatedComponent(TouchableOpacity);

const Checkbox = ({
	checked = false,
	onPress,
	disabled = false,
}: CheckboxProps) => {
	const progress = useSharedValue(0);

	$.useVariants({ checked, disabled });

	useEffect(() => {
		progress.value = withTiming(checked ? 1 : 0, { duration: 350 });
	}, [checked, progress]);

	const animatedProps = useAnimatedProps(() => ({
		strokeDashoffset: CHECKMARK_LENGTH * (1 - progress.value),
	}));

	return (
		<TouchableOpacity
			accessibilityRole="checkbox"
			accessibilityState={{ checked, disabled }}
			onPress={onPress}
			activeOpacity={0.8}
			disabled={disabled}
			style={$.container}
		>
			<Svg height={vs(18)} viewBox="0 0 18 18" width={vs(18)}>
				<AnimatedPath
					animatedProps={animatedProps}
					d="M3 8.5 L6.75 13 L14.25 4"
					fill="none"
					stroke="#fff"
					strokeDasharray={CHECKMARK_LENGTH}
					strokeLinecap="round"
					strokeWidth={vs(2)}
					// strokeOpacity is usually 1, but if we want to hide it completely when not checked we rely on dashoffset.
				/>
			</Svg>
		</TouchableOpacity>
	);
};

const $ = StyleSheet.create((theme) => ({
	container: {
		borderWidth: vs(1),
		borderRadius: vs(2),
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.colors.neutral[100],
		width: vs(32),
		height: vs(32),
		borderColor: theme.colors.neutral[400],
		variants: {
			checked: {
				true: {
					borderColor: theme.colors.primary[200],
					backgroundColor: theme.colors.primary[400],
				},
			},
			disabled: {
				true: {
					opacity: 0.5,
					backgroundColor: theme.colors.neutral[200],
				},
			},
		},
	},
}));

export default Checkbox;
