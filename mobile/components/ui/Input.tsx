import { parseNumber } from "@/utils/Format";
import { useState, forwardRef, memo } from "react";
import { Text, TextInput, type TextInputProps, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	withTiming,
} from "react-native-reanimated";
import { StyleSheet, type Theme, withUnistyles } from "react-native-unistyles";
import { vs } from "@/utils/Scale";

export interface InputProps extends TextInputProps {
	label?: string;
	error?: string;
	left?: React.ReactNode;
	right?: React.ReactNode;
	containerStyle?: any;
	size?: "sm" | "md" | "lg";
	maxValue?: number;
	minValue?: number;
}

const getInputSizes = (theme: Theme) => ({
	lg: {
		...theme.typography.bodyXl,
		lineHeight: undefined,
		paddingVertical: vs(16),
		paddingHorizontal: vs(24),
	},
	md: {
		...theme.typography.bodyLg,
		lineHeight: undefined,
		paddingVertical: vs(14),
		paddingHorizontal: vs(24),
	},
	sm: {
		...theme.typography.bodyMd,
		lineHeight: undefined,
		paddingVertical: vs(12),
		paddingHorizontal: vs(16),
	},
});

const stylesheet = StyleSheet.create((theme) => ({
	container: {},
	outline: {
		borderWidth: vs(1),
		borderColor: theme.colors.neutral[300],
		borderRadius: theme.radius.sm,
		backgroundColor: theme.colors.neutral[100],
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.sm,
		variants: {
			right: { true: { paddingRight: vs(10) } },
			left: { true: { paddingLeft: vs(10) } },
			isValueExisting: { true: { borderColor: theme.colors.neutral[400] } },
			error: {
				true: {
					borderColor: theme.colors.error[300],
					backgroundColor: theme.colors.error[100],
				},
			},
			disabled: {
				true: {
					backgroundColor: theme.colors.neutral[100],
					borderColor: theme.colors.neutral[300],
				},
			},
		},
		compoundVariants: [
			{ left: true, size: "lg", styles: { paddingLeft: vs(12) } },
			{ right: true, size: "lg", styles: { paddingRight: vs(12) } },
			{ left: true, size: "sm", styles: { paddingLeft: vs(8) } },
			{ right: true, size: "sm", styles: { paddingRight: vs(8) } },
		],
	},
	input: {
		flex: 1,
		color: theme.colors.primary[700],
		variants: {
			size: getInputSizes(theme),
			left: { true: { paddingLeft: vs(0) } },
			right: { true: { paddingRight: vs(0) } },
			error: { true: { color: theme.colors.error[400] } },
			disabled: { true: { color: theme.colors.neutral[400] } },
		},
	},
	labelContainer: {
		position: "absolute",
		left: vs(16),
		paddingHorizontal: vs(6),
		zIndex: 4,
		backgroundColor: theme.colors.neutral[100],
		variants: {
			error: { true: { backgroundColor: theme.colors.error[100] } },
		},
	},
	// Label styles separate from animation to avoid complex dynamic Unistyle functions if prone to errors
	labelBase: {
		color: theme.colors.neutral[600],
		variants: {
			error: { true: { color: theme.colors.error[500] } },
		},
	},
	errorText: {
		...theme.typography.bodyMd,
		color: theme.colors.error[400],
		marginTop: theme.spacing.sm,
	},
}));

// Separated Label component to handle Reanimated style properly
const AnimatedLabel = ({ label, isValueExisting, styles, theme }: any) => {
	// We can use Reanimated for smooth transitions instead of CSS transitions which Unistyles supports but might be tricky in pure React Native without valid props support
	// Calculate value outside of worklet to avoid crash (vs is not a worklet)
	const translateYValue = -vs(30);

	const animStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: withTiming(isValueExisting ? translateYValue : 0, {
						duration: 300,
					}),
				},
			],
			opacity: withTiming(isValueExisting ? 1 : 0, { duration: 300 }),
		};
	});

	return (
		<Animated.View style={[styles.labelContainer, animStyle]}>
			<Animated.Text style={styles.labelBase}>{label}</Animated.Text>
		</Animated.View>
	);
};

const UniTextInput = withUnistyles(TextInput, (theme) => ({
	placeholderTextColor: theme.colors.neutral[500],
}));

const Input = forwardRef<TextInput, InputProps>(
	(
		{
			containerStyle,
			editable = true,
			error,
			size = "md",
			left,
			right,
			label,
			placeholder,
			onChangeText,
			value,
			maxValue,
			minValue,
			style, // Destructure style here
			...rest
		},
		ref,
	) => {
		const [isFocused, setIsFocused] = useState<boolean>(false);

		const [hasText, setHasText] = useState(!!value);

		const isValueExisting = hasText || !!value || isFocused;
		// Should show label if focused too? Usually yes for floating labels.
		// Added isFocused check for floating label behavior.

		if (!placeholder) {
			placeholder = label;
		}

		stylesheet.useVariants({
			size,
			left: !!left,
			right: !!right,
			isValueExisting,
			error: !!error,
			disabled: !editable,
		});

		return (
			<View style={[stylesheet.container, containerStyle]}>
				<View style={stylesheet.outline}>
					{!!label && (
						<AnimatedLabel
							label={label}
							isValueExisting={isValueExisting}
							styles={stylesheet}
						/>
					)}

					{left}

					<UniTextInput
						ref={ref}
						disableFullscreenUI={true}
						editable={editable}
						onBlur={(e) => {
							setIsFocused(false);
							rest.onBlur?.(e);
						}}
						onChangeText={(text) => {
							if (maxValue !== undefined) {
								const numericVal = parseNumber(text);
								if (numericVal > maxValue) {
									return;
								}
							}
							onChangeText?.(text);
							setHasText(!!text);
						}}
						onFocus={(e) => {
							setIsFocused(true);
							rest.onFocus?.(e);
						}}
						placeholder={!isValueExisting ? placeholder : ""}
						// If label exists and is not floating (not existing), hide placeholder to avoid overlap?
						// Material design usually: placeholder shown when focused.
						value={value}
						style={[
							stylesheet.input,
							rest.multiline && { textAlignVertical: "top", paddingTop: vs(24) }, 
							style
						]}
						{...rest}
					/>

					{right}
				</View>
				{!!error && <Text style={stylesheet.errorText}>{error}</Text>}
			</View>
		);
	},
);

export default memo(Input);
