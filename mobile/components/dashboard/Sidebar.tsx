import { usePathname, useRouter } from "expo-router";
import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import IcSignOut from "@/assets/icons/sign-out.svg";
import Logo from "@/assets/images/logo.svg";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { LogoutService } from "@/services/LogoutService";
import { SyncService } from "@/services/SyncService";
import { vs } from "@/utils/Scale";
import { LIST_SIDEBAR_ITEMS } from "./Sidebar.cons";
import SidebarItem from "./SidebarItem";
// import { Image } from "expo-image";
// import ALogo from "@/assets/images/logo.webp";

const UniIcSignOut = withUnistyles(IcSignOut, (theme) => ({
	color: theme.colors.error[400],
}));

const Sidebar = () => {
	const router = useRouter();
	const pathname = usePathname();
	const business = useBusinessStore((state) => state.business);
	const user = useAuthStore((state) => state.user);

	return (
		<View style={$.container}>
			<Logo height={vs(80)} width={vs(80)} />
			{/* <Image
				source={ALogo}
				style={{ width: vs(100), height: vs(100) }}
				contentFit="contain"
			/> */}
			<ScrollView
				bounces={false}
				contentContainerStyle={$.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={$.sidebarItems}>
					{LIST_SIDEBAR_ITEMS.filter(tab => {
						if (tab.label === "Assistant") {
							// Only show Assistant for ultra users and OWNER role
							return (
								business?.subscriptionStatus === "ultra" && user?.roleCode === "OWNER"
							);
						}
						// Attendance example (commented out in cons.ts anyway, but good practice):
						if (tab.label === "Attendance") return false;

						return true;
					}).map(({ Icon, ...tab }) => {
						const comparedPath = tab.path.replace("/(dashboard)", "");
						const isActive =
							pathname === comparedPath ||
							(comparedPath === "" && pathname === "/");

						return (
							<SidebarItem
								Icons={Icon}
								isActive={isActive}
								key={tab.label}
								label={tab.label}
								onPress={() => router.replace(tab.path as any)}
							/>
						);
					})}
				</View>
			</ScrollView>
			<TouchableOpacity
				style={$.signOutButton}
				onPress={async () => {
					const unsyncedCount = await SyncService.getUnsyncedCount();
					Alert.alert(
						"Sign Out",
						unsyncedCount > 0
							? `Warning: You have ${unsyncedCount} unsynced transactions. Signing out will DELETE them permanently. Are you sure?`
							: "Are you sure you want to sign out?",
						[
							{
								text: "Cancel",
								style: "cancel",
							},
							{
								text: unsyncedCount > 0 ? "Delete & Sign Out" : "Sign Out",
								style: "destructive",
								onPress: () => {
									LogoutService.performLogout();
								},
							},
						]
					);
				}}
			>
				<UniIcSignOut height={vs(26)} width={vs(26)} />
				<Text adjustsFontSizeToFit numberOfLines={1} style={$.signOut}>
					Sign Out
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const $ = StyleSheet.create((theme, rt) => ({
	container: {
		backgroundColor: theme.colors.sup.yellow,
		width: vs(116) + rt.insets.left,
		shadowColor: "#000",
		shadowOffset: { height: 0, width: 0 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
		zIndex: 10,
		alignItems: "center",
		paddingTop: rt.insets.top,
		paddingLeft: rt.insets.left,
	},
	scrollContent: {
		alignItems: "center",
		justifyContent: "space-between",
		flexGrow: 1,
		paddingBottom: theme.spacing.xl,
		paddingTop: theme.spacing.xxl,
	},
	sidebarItems: {
		gap: theme.spacing.sm,
		alignItems: "center",
	},
	signOutButton: {
		width: vs(68),
		height: vs(68),
		borderRadius: theme.radius.lg,
		backgroundColor: theme.colors.error[100],
		justifyContent: "center",
		alignItems: "center",
		gap: vs(2),
		marginVertical: theme.spacing.lg,
	},
	signOut: {
		...theme.typography.labelXs,
		color: theme.colors.error[500],
	},
}));

export default Sidebar;
