import { Slot, SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useCustomFonts } from "@/config/useCustomFonts";
import "react-native-reanimated";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { DatabaseProvider } from "@/db/provider";
import { queryClient } from "@/lib/ReactQuery";
import { useSync } from "@/services/hooks/useSync";
import { useAuthStore } from "@/store/useAuthStore";
import LoadingOverlay from "../components/ui/LoadingOverlay";

if (__DEV__) {
	require("../lib/Reactotron");
}

SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
	const { loaded } = useCustomFonts();
	const { isLoggedIn } = useAuthStore();
	const segments = useSegments();
	const router = useRouter();
	useSync();

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	useEffect(() => {
		if (!loaded) return;

		const inAuthGroup = segments[0] === "(auth)";

		if (isLoggedIn && inAuthGroup) {
			router.replace("/(dashboard)");
		} else if (!isLoggedIn && segments[0] !== "(auth)") {
			// If not logged in and not in auth group, redirect to sign-in.
			// Using replace to avoid back button issues.
			router.replace("/(auth)/sign-in");
		}
	}, [isLoggedIn, segments, loaded]);

	if (!loaded) {
		return <Slot />;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="(dashboard)" />
			<Stack.Screen name="(auth)" />
			<Stack.Screen name="+not-found" />
			<Stack.Screen
				name="product/add"
				options={{
					headerShown: true,
				}}
			/>
			<Stack.Screen
				name="expense/add"
				options={{
					headerShown: true,
				}}
			/>
			<Stack.Screen
				name="modal/product/upload-image"
				options={{ presentation: "transparentModal", animation: "fade" }}
			/>
			<Stack.Screen
				name="modal/product/select-category"
				options={{ presentation: "transparentModal", animation: "fade" }}
			/>
			<Stack.Screen
				name="modal/product/select-ingredient"
				options={{ presentation: "transparentModal", animation: "fade" }}
			/>
			<Stack.Screen
				name="modal/product/select-measure-unit"
				options={{ presentation: "transparentModal", animation: "fade" }}
			/>
			<Stack.Screen
				name="modal/order/add-item"
				options={{ presentation: "transparentModal", animation: "fade" }}
			/>
			<Stack.Screen
				name="modal/order/discount"
				options={{ presentation: "transparentModal", animation: "fade" }}
			/>
			<Stack.Screen
				name="modal/business/update-store"
				options={{ presentation: "transparentModal", animation: "fade" }}
			/>
			<Stack.Screen
				name="modal/business/add-employee"
				options={{ presentation: "transparentModal", animation: "fade" }}
			/>
			<Stack.Screen
				name="modal/business/edit-profile"
				options={{ presentation: "transparentModal", animation: "fade" }}
			/>
		</Stack>
	);
};

const RootLayout = () => {
	return (
		<KeyboardProvider>
			<DatabaseProvider>
				<QueryClientProvider client={queryClient}>
					<StatusBar style="auto" />
					<InitialLayout />
				</QueryClientProvider>
			</DatabaseProvider>
			<LoadingOverlay />
		</KeyboardProvider>
	);
};

export default RootLayout;
