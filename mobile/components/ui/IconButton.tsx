import { useState } from "react";
import { TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { vs } from "@/utils/Scale";
import type { Theme } from "react-native-unistyles";

export interface IconButtonProps extends TouchableOpacityProps {
	variant:
		| "primary"
		| "secondary"
		| "soft"
		| "neutral"
		| "neutral-no-stroke"
		| "warning"
		| "secondary-warning"
		| "positive";
	size?: "sm" | "md" | "lg";
	Icon: React.ElementType; // Using ElementType for component reference
}

const getButtonStyles = (
	theme: Theme,
	state: "default" | "pressed" | "disabled",
) => {
	const { colors } = theme;

	const stateStyles = {
		default: {
			primary: { backgroundColor: colors.primary[400] },
			secondary: {
				backgroundColor: colors.neutral[100],
				borderWidth: vs(1),
				borderColor: colors.primary[400],
			},
			soft: {
				backgroundColor: colors.primary[100],
				borderWidth: vs(1),
				borderColor: colors.primary[400],
			},
			neutral: {
				backgroundColor: colors.neutral[100],
				borderWidth: vs(1),
				borderColor: colors.neutral[400],
			},
			"neutral-no-stroke": { backgroundColor: colors.transparent },
			warning: { backgroundColor: colors.error[400] },
			"secondary-warning": {
				backgroundColor: colors.neutral[100],
				borderWidth: vs(1),
				borderColor: colors.error[400],
			},
			positive: { backgroundColor: colors.positive[400] },
		},
		pressed: {
			primary: { backgroundColor: colors.pressed[3] },
			secondary: {
				backgroundColor: colors.pressed[1],
				borderWidth: vs(1),
				borderColor: colors.primary[500],
			},
			soft: {
				backgroundColor: colors.pressed[2],
				borderWidth: vs(1),
				borderColor: colors.primary[500],
			},
			neutral: {
				backgroundColor: colors.pressed[4],
				borderWidth: vs(1),
				borderColor: colors.neutral[400],
			},
			"neutral-no-stroke": { backgroundColor: colors.pressed[4] },
			warning: { backgroundColor: colors.pressed[5] },
			"secondary-warning": {
				backgroundColor: colors.pressed[6],
				borderWidth: vs(1),
				borderColor: colors.error[500],
			},
			positive: { backgroundColor: colors.pressed[9] },
		},
		disabled: {
			primary: { backgroundColor: colors.primary[200] },
			secondary: {
				backgroundColor: colors.neutral[100],
				borderWidth: vs(1),
				borderColor: colors.primary[200],
			},
			soft: {
				backgroundColor: colors.primary[100],
				borderWidth: vs(1),
				borderColor: colors.primary[300],
			},
			neutral: {
				backgroundColor: colors.neutral[200],
				borderWidth: vs(1),
				borderColor: colors.neutral[300],
			},
			"neutral-no-stroke": { backgroundColor: colors.neutral[200] },
			warning: { backgroundColor: colors.error[200] },
			"secondary-warning": {
				backgroundColor: colors.neutral[100],
				borderWidth: vs(1),
				borderColor: colors.error[200],
			},
			positive: { backgroundColor: colors.positive[200] },
		},
	};
	return stateStyles[state];
};

const getButtonIconStyles = (
	theme: Theme,
	state: "default" | "pressed" | "disabled",
) => {
	const { colors } = theme;
	const stateStyles = {
		default: {
			primary: { color: colors.neutral[100] },
			secondary: { color: colors.primary[400] },
			soft: { color: colors.primary[400] },
			neutral: { color: colors.neutral[600] },
			"neutral-no-stroke": { color: colors.primary[600] },
			warning: { color: colors.neutral[100] },
			"secondary-warning": { color: colors.error[400] },
			positive: { color: colors.neutral[100] },
		},
		pressed: {
			primary: { color: colors.neutral[100] },
			secondary: { color: colors.primary[500] },
			soft: { color: colors.primary[600] },
			neutral: { color: colors.neutral[600] },
			"neutral-no-stroke": { color: colors.neutral[600] },
			warning: { color: colors.neutral[100] },
			"secondary-warning": { color: colors.error[500] },
			positive: { color: colors.neutral[100] },
		},
		disabled: {
			primary: { color: colors.neutral[100] },
			secondary: { color: colors.primary[200] },
			soft: { color: colors.primary[200] },
			neutral: { color: colors.neutral[400] },
			"neutral-no-stroke": { color: colors.neutral[400] },
			warning: { color: colors.neutral[100] },
			"secondary-warning": { color: colors.error[200] },
			positive: { color: colors.neutral[100] },
		},
	};
	return stateStyles[state];
};

const stylesheet = StyleSheet.create((theme) => ({
	container: (pressed: boolean) => ({
		borderRadius: theme.radius.sm,
		justifyContent: "center",
		alignItems: "center",
		variants: {
			variant: getButtonStyles(theme, pressed ? "pressed" : "default"),
			size: {
				lg: { padding: vs(16) },
				md: { padding: vs(14) },
				sm: { padding: vs(12) },
			},
		},
		compoundVariants: [
			{
				size: "lg",
				variant: "neutral-no-stroke",
				styles: { padding: vs(12) },
			},
			{
				size: "md",
				variant: "neutral-no-stroke",
				styles: { padding: vs(10) },
			},
			{
				size: "sm",
				variant: "neutral-no-stroke",
				styles: { padding: vs(8) },
			},
		],
	}),
	icon: (pressed: boolean) => ({
		variants: {
			variant: getButtonIconStyles(theme, pressed ? "pressed" : "default"),
		},
	}),
}));

const iconSizes = {
	lg: { width: vs(28), height: vs(28) },
	md: { width: vs(24), height: vs(24) },
	sm: { width: vs(18), height: vs(18) },
};

const IconButton = ({
	variant,
	size = "md",
	Icon,
	style,
	...rest
}: IconButtonProps) => {
	const [pressed, setPressed] = useState(false);

	stylesheet.useVariants({ variant, size });

	// Get icon style specifically for color
	// We need to resolve the color manually or pass style to Icon if it accepts it.
	// Assuming Icon accepts style or color/width/height props.
	// The original passed width/height and style.

	const iconSize = iconSizes[size];

	return (
		<TouchableOpacity
			activeOpacity={1}
			onPressIn={() => setPressed(true)}
			onPressOut={() => setPressed(false)}
			style={[stylesheet.container(pressed), style]}
			{...rest}
		>
			<Icon
				width={iconSize.width}
				height={iconSize.height}
				style={stylesheet.icon(pressed)}
			/>
		</TouchableOpacity>
	);
};

export default IconButton;
