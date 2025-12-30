import { useState } from "react";
import {
	ActivityIndicator,
	Text,
	TouchableOpacity,
	type TouchableOpacityProps,
} from "react-native";
import {
	StyleSheet,
	UnistylesRuntime,
	withUnistyles,
} from "react-native-unistyles";
import { vs } from "@/utils/Scale";
import type { Theme } from "react-native-unistyles";

const Indicator = withUnistyles(ActivityIndicator);

export type ButtonVariant =
	| "primary"
	| "secondary"
	| "soft"
	| "link"
	| "neutral"
	| "warning"
	| "positive";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends TouchableOpacityProps {
	variant?: ButtonVariant;
	size?: ButtonSize;
	title: string;
	isLoading?: boolean;
	leftIcon?: (size: number, color: string) => React.ReactNode;
	rightIcon?: (size: number, color: string) => React.ReactNode;
	right?: React.ReactNode;
}




const getButtonVariants = (
	theme: Theme,
	state: "default" | "pressed" | "disabled",
) => {
	const { colors } = theme;

	const stateStyles = {
		default: {
			primary: { backgroundColor: colors.primary[400] },
			secondary: {
				backgroundColor: colors.transparent,
				borderWidth: vs(1),
				borderColor: colors.primary[400],
			},
			soft: {
				backgroundColor: colors.primary[100],
				borderWidth: vs(1),
				borderColor: colors.primary[400],
			},
			link: {},
			neutral: {
				backgroundColor: colors.neutral[100],
				borderWidth: vs(1),
				borderColor: colors.neutral[400],
			},
			warning: { backgroundColor: colors.error[400] },
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
			link: {},
			neutral: {
				backgroundColor: colors.pressed[4],
				borderWidth: vs(1),
				borderColor: colors.neutral[400],
			},
			warning: { backgroundColor: colors.pressed[5] },
			positive: { backgroundColor: colors.pressed[9] },
		},
		disabled: {
			primary: { backgroundColor: colors.primary[200] },
			secondary: { borderWidth: vs(1), borderColor: colors.primary[200] },
			soft: {
				backgroundColor: colors.primary[100],
				borderWidth: vs(1),
				borderColor: colors.primary[300],
			},
			link: {},
			neutral: {
				backgroundColor: colors.neutral[100],
				borderWidth: vs(1),
				borderColor: colors.neutral[300],
			},
			warning: { backgroundColor: colors.error[200] },
			positive: { backgroundColor: colors.positive[200] },
		},
	};
	return stateStyles[state];
};

const buttonSizes = {
	lg: {
		paddingHorizontal: vs(32),
		paddingVertical: vs(16),
		gap: vs(8),
	},
	md: {
		paddingHorizontal: vs(28),
		paddingVertical: vs(14),
		gap: vs(8),
	},
	sm: {
		paddingHorizontal: vs(24),
		paddingVertical: vs(12),
		gap: vs(6),
	},
};

const buttonIconSizes = {
	lg: vs(24),
	md: vs(20),
	sm: vs(16),
};

const getButtonTitleStyles = (state: "default" | "pressed" | "disabled") => {
	const theme = UnistylesRuntime.getTheme();
	const { colors } = theme;

	const stateStyles = {
		default: {
			primary: { color: colors.neutral[100] },
			secondary: { color: colors.primary[400] },
			soft: { color: colors.primary[400] },
			link: { color: colors.primary[400] },
			neutral: { color: colors.neutral[600] },
			warning: { color: colors.neutral[100] },
			positive: { color: colors.neutral[100] },
		},
		pressed: {
			primary: { color: colors.neutral[100] },
			secondary: { color: colors.primary[500] },
			soft: { color: colors.primary[600] },
			link: { color: colors.pressed[3] },
			neutral: { color: colors.neutral[600] },
			warning: { color: colors.neutral[100] },
			positive: { color: colors.neutral[100] },
		},
		disabled: {
			primary: { color: colors.neutral[100] },
			secondary: { color: colors.primary[200] },
			soft: { color: colors.primary[200] },
			link: { color: colors.primary[200] },
			neutral: { color: colors.neutral[400] },
			warning: { color: colors.neutral[100] },
			positive: { color: colors.neutral[100] },
		},
	};

	return stateStyles[state];
};

const stylesheet = StyleSheet.create((theme) => ({
	container: (state: "default" | "pressed" | "disabled" = "default") => ({
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "row",
		borderRadius: theme.radius.sm,
		variants: {
			variant: getButtonVariants(theme, state),
			size: buttonSizes,
			disabled: {
				true: {},
			},
		},
		compoundVariants: [
			{
				variant: "link",
				styles: {
					paddingVertical: vs(4),
					paddingHorizontal: vs(8),
					alignSelf: "flex-start",
				},
			},
		],
	}),
	title: (state: "default" | "pressed" | "disabled" = "default") => ({
		variants: {
			variant: getButtonTitleStyles(state),
			size: {
				lg: { ...theme.typography.buttonLg },
				md: { ...theme.typography.buttonMd },
				sm: { ...theme.typography.buttonSm },
			},
		},
	}),
}));

const Button = ({
	variant = "primary",
	size = "md",
	disabled = false,
	onPress,
	title,
	style,
	isLoading = false,
	leftIcon,
	rightIcon,
	right,
	...rest
}: ButtonProps) => {
	const [pressed, setPressed] = useState<boolean>(false);

	stylesheet.useVariants({ variant, size });

	const state = disabled ? "disabled" : pressed ? "pressed" : "default";

	const color =
		getButtonTitleStyles(state)[
			variant as keyof ReturnType<typeof getButtonTitleStyles>
		]?.color || UnistylesRuntime.getTheme().colors.neutral[600];

	return (
		<TouchableOpacity
			activeOpacity={1}
			disabled={disabled}
			onPress={onPress}
			onPressIn={() => setPressed(true)}
			onPressOut={() => setPressed(false)}
			style={[stylesheet.container(state), style]}
			{...rest}
		>
			{isLoading ? (
				<Indicator size="small" uniProps={() => ({ color })} />
			) : leftIcon ? (
				leftIcon(buttonIconSizes[size], color)
			) : null}

			<Text
				adjustsFontSizeToFit
				numberOfLines={1}
				style={stylesheet.title(state)}
			>
				{title}
			</Text>
			{rightIcon && rightIcon(buttonIconSizes[size], color)}
			{right}
		</TouchableOpacity>
	);
};

export default Button;
