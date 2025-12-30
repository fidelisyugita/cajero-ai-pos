import { Slot } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Sidebar from "@/components/dashboard/Sidebar";
import SyncIndicator from "@/components/ui/SyncIndicator";

const DashboardLayout = () => {
	return (
		<View style={styles.container}>
			<Sidebar />
			<View style={styles.content}>
				<Slot />
				<SyncIndicator />
			</View>
		</View>
	);
};

const styles = StyleSheet.create((theme) => ({
	container: {
		flex: 1,
		flexDirection: "row",
	},
	content: {
		flex: 1,
	},
}));

export default DashboardLayout;
