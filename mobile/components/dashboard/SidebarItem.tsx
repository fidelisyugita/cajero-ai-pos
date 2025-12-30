import type { FC } from "react";
import { Text, TouchableOpacity } from "react-native";
import type { SvgProps } from "react-native-svg";
import { StyleSheet } from "react-native-unistyles";
import colors from "@/tokens/Colors";
import { vs } from "@/utils/Scale";

interface SidebarItemProps {
	Icons: FC<SvgProps>[];
	isActive: boolean;
	label: string;
	onPress: () => void;
}

const SidebarItem = ({ Icons, isActive, label, onPress }: SidebarItemProps) => {
	const Icon = isActive ? Icons[1] : Icons[0];
	styles.useVariants({ isActive });

	return (
		<TouchableOpacity
			disabled={isActive}
			onPress={onPress}
			style={styles.container}
		>
			<Icon color={colors.primary[400]} height={vs(36)} width={vs(36)} />
			<Text style={styles.label} adjustsFontSizeToFit numberOfLines={1}>
				{label}
			</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create((theme) => ({
	container: {
		borderRadius: theme.radius.lg,
		width: vs(68),
		height: vs(68),
		alignItems: "center",
		gap: theme.spacing.xs / 2,
		justifyContent: "center",
		variants: {
			isActive: {
				true: {
					borderWidth: vs(1),
					borderColor: theme.colors.primary[400],
					borderRadius: theme.radius.lg,
				},
			},
		},
	},
	label: {
		...theme.typography.labelXs,
		color: theme.colors.primary[400],
		textAlign: "center",
	},
}));

export default SidebarItem;
