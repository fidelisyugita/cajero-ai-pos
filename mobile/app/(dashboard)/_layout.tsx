import { Redirect, Slot } from "expo-router";
import { memo } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Sidebar from "@/components/dashboard/Sidebar";
import SyncIndicator from "@/components/ui/SyncIndicator";
import { useAuthStore } from "@/store/useAuthStore";

const DashboardLayout = memo(() => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <View style={styles.container}>
      <Sidebar />
      <View style={styles.content}>
        <Slot />
        <SyncIndicator />
      </View>
    </View>
  );
});

const styles = StyleSheet.create((_theme) => ({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  content: {
    flex: 1,
  },
}));

export default DashboardLayout;
