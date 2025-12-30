import type { PropsWithChildren } from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { vs } from "@/utils/Scale";

export interface FormSectionCardProps extends PropsWithChildren {
	title: string;
	required?: boolean;
	style?: StyleProp<ViewStyle>;
	contentStyle?: StyleProp<ViewStyle>;
	headerRight?: React.ReactNode;
}

const FormSectionCard = ({
	title,
	required,
	children,
	style,
	contentStyle,
	headerRight,
}: FormSectionCardProps) => {
	return (
		<View style={[$.container, style]}>
			<View style={$.header}>
				<View style={$.headerContent}>
					<Text style={$.title}>
						{title}
						{required && <Text style={$.required}> *</Text>}
					</Text>
					{headerRight}
				</View>
			</View>
			<View style={[$.content, contentStyle]}>{children}</View>
		</View>
	);
};

const $ = StyleSheet.create((theme) => ({
	container: {
		borderRadius: theme.radius.lg,
		borderWidth: vs(1),
		borderColor: theme.colors.neutral[300],
		backgroundColor: theme.colors.neutral[100],
	},
	title: {
		...theme.typography.heading4,
		color: theme.colors.neutral[700],
	},
	header: {
		backgroundColor: theme.colors.sup.red,
		overflow: "hidden",
		paddingHorizontal: theme.spacing.xl,
		paddingVertical: theme.spacing.md,
		borderTopLeftRadius: theme.radius.lg,
		borderTopRightRadius: theme.radius.lg,
	},
	headerContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	required: {
		color: theme.colors.primary[400],
	},
	content: {
		padding: theme.spacing.xl,
		gap: vs(20),
	},
}));

export default FormSectionCard;
