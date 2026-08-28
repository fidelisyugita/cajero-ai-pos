import { Slot, SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useCustomFonts } from "@/config/useCustomFonts";
import "react-native-reanimated";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { PosErrorBoundary } from "@/components/ui/PosErrorBoundary";
import { DatabaseProvider } from "@/db/provider";
import { queryClient } from "@/lib/ReactQuery";
import { initSentry, wrapRootComponent } from "@/lib/sentry";
import { useSync } from "@/services/hooks/useSync";
import { useAuthStore } from "@/store/useAuthStore";
import LoadingOverlay from "../components/ui/LoadingOverlay";

initSentry();

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
      router.replace("/(auth)/sign-in");
    }
  }, [isLoggedIn, segments, loaded, router.replace]);

  if (!loaded) {
    return <Slot />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
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
        name="product/manage-variants"
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
      <Stack.Screen
        name="modal/product/edit-variant"
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
          <AnalyticsProvider>
            <PosErrorBoundary>
              <StatusBar style="auto" />
              <InitialLayout />
            </PosErrorBoundary>
          </AnalyticsProvider>
        </QueryClientProvider>
      </DatabaseProvider>
      <LoadingOverlay />
    </KeyboardProvider>
  );
};

export default wrapRootComponent(RootLayout);
