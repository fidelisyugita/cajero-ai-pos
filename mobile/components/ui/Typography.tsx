import { Text as NativeText, type TextProps } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

type TypographyVariant =
	| "display"
	| "headingXl"
	| "headingLg"
	| "headingMd"
	| "headingSm"
	| "bodyXl"
	| "bodyLg"
	| "bodyMd"
	| "bodySm"
	| "caption"
	| "label"; // Added label as seen in other files

interface TypographyProps extends TextProps {
	variant?: TypographyVariant;
	color?: string;
	weight?: "regular" | "medium" | "bold";
	align?: "left" | "center" | "right";
}

const stylesheet = StyleSheet.create((theme) => ({
	text: {
		color: theme.colors.neutral[700],
		variants: {
			variant: {
				display: { ...theme.typography.heading1 },
				headingXl: { ...theme.typography.heading1 },
				headingLg: { ...theme.typography.heading2 },
				headingMd: { ...theme.typography.heading3 },
				headingSm: { ...theme.typography.heading4 },
				bodyXl: { ...theme.typography.bodyXl },
				bodyLg: { ...theme.typography.bodyLg },
				bodyMd: { ...theme.typography.bodyMd },
				bodySm: { ...theme.typography.bodySm },
				caption: { ...theme.typography.bodyXs },
				label: { ...theme.typography.labelSm }, // Mapping label to labelSm for now
			},
			weight: {
				regular: { fontFamily: theme.typography.bodyMd.fontFamily }, // Fallback logic, refinements might be needed based on actual theme
				medium: { fontFamily: theme.typography.labelMd.fontFamily },
				bold: { fontWeight: "bold" },
			},
			align: {
				left: { textAlign: "left" },
				center: { textAlign: "center" },
				right: { textAlign: "right" },
			},
		},
	},
}));

const UniText = withUnistyles(NativeText, (theme) => ({
	// Dynamic props if needed
}));

const Text = ({
	variant = "bodyMd",
	color,
	weight,
	align,
	style,
	...props
}: TypographyProps) => {
	stylesheet.useVariants({
		variant,
		weight,
		align,
	});

	return (
		<NativeText
			style={[stylesheet.text, color ? { color } : undefined, style]}
			{...props}
		/>
	);
};

export default Text;
