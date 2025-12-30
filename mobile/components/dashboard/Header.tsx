import { Image } from "expo-image";
import { Text, View } from "react-native";
import { t } from "@/services/i18n";
import { StyleSheet } from "react-native-unistyles";
import { useAuthStore } from "@/store/useAuthStore";
import { vs } from "@/utils/Scale";

import { useReferenceStore } from "@/store/useReferenceStore";
import { useEffect } from "react";

interface HeaderProps {
	children?: React.ReactNode;
}

const Header = ({ children }: HeaderProps) => {
	const fetchAll = useReferenceStore((state) => state.fetchAll);
	const transactionTypes = useReferenceStore((state) => state.transactionTypes);

	useEffect(() => {
		if (transactionTypes.length === 0) {
			fetchAll();
		}
	}, []);

	return (
		<View style={$.container}>
			<View style={$.leftContainer}>
				{children}
			</View>
			<Profile />
		</View>
	);
};

const Profile = () => {
	const user = useAuthStore((state) => state.user);

	return (
		<View style={$.profileContainer}>
			<Image
				contentFit="cover"
				source={user?.imageUrl || "https://github.com/shadcn.png"}
				style={$.avatar}
			/>
			<View style={$.profileInfoContainer}>
				<Text adjustsFontSizeToFit style={$.profileName}>{user?.name || t("guest")}</Text>
				<Text adjustsFontSizeToFit style={$.profilePosition}>{user?.roleCode || t("visitor")}</Text>
			</View>
		</View>
	);
};

const $ = StyleSheet.create((theme, rt) => ({
	container: {
		backgroundColor: theme.colors.neutral[200],
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: rt.insets.top || theme.spacing.xl,
		paddingBottom: theme.spacing.xl,
		paddingHorizontal: theme.spacing.xl,
		zIndex: 9,
		gap: theme.spacing.md,
	},
	leftContainer: {
		flexDirection: "row",
		gap: theme.spacing.md,
		alignItems: "center",
		flex: 1,
	},
	profileContainer: {
		flexDirection: "row",
		gap: theme.spacing.sm,
		flexShrink: 0,
	},
	avatar: {
		width: vs(48),
		height: vs(48),
		borderRadius: vs(24),
		backgroundColor: theme.colors.primary[300],
	},
	profileInfoContainer: {
		gap: theme.spacing.xs,
		justifyContent: 'center',
	},
	profileName: {
		...theme.typography.labelLg,
		color: theme.colors.neutral[700],
	},
	profilePosition: {
		...theme.typography.bodySm,
		color: theme.colors.neutral[600],
	},
}));

export default Header;
