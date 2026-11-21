import { type Href, usePathname, useRouter } from "expo-router";
import { memo, useCallback, useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import IcSignOut from "@/assets/icons/sign-out.svg";
import Logo from "@/assets/images/logo.svg";
import { LogoutService } from "@/services/LogoutService";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { vs } from "@/utils/Scale";
import { LIST_SIDEBAR_ITEMS } from "./Sidebar.cons";
import SidebarItem from "./SidebarItem";

const UniIcSignOut = withUnistyles(IcSignOut, (theme) => ({
  color: theme.colors.error[400],
}));

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isUltraSubscription = useBusinessStore(
    (state) => state.business?.subscriptionStatus === "ultra",
  );
  const roleCode = useAuthStore((state) => state.user?.roleCode);

  const isHighOrderRole = roleCode === "OWNER" || roleCode === "MANAGER";

  const visibleTabs = useMemo(
    () =>
      LIST_SIDEBAR_ITEMS.filter((tab) => {
        if (tab.label === "Assistant") return isUltraSubscription && isHighOrderRole;
        if (tab.label === "Report") return isHighOrderRole;
        return true;
      }),
    [isUltraSubscription, isHighOrderRole],
  );

  const handleNavigate = useCallback(
    (path?: string) => {
      if (path) router.replace(path as Href);
    },
    [router],
  );

  const handleSignOut = useCallback(() => {
    LogoutService.performSafeLogout();
  }, []);

  return (
    <View style={$.container}>
      <Logo height={vs(80)} width={vs(80)} />
      <ScrollView
        bounces={false}
        contentContainerStyle={$.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={$.sidebarItems}>
          {visibleTabs.map(({ Icon, ...tab }) => {
            const comparedPath = tab.path.replace("/(dashboard)", "");
            const isActive = pathname === comparedPath || (comparedPath === "" && pathname === "/");

            return (
              <SidebarItem
                Icons={Icon}
                isActive={isActive}
                key={tab.label}
                label={tab.label}
                onPress={handleNavigate}
                path={tab.path}
              />
            );
          })}
        </View>
      </ScrollView>
      <TouchableOpacity style={$.signOutButton} onPress={handleSignOut}>
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

export default memo(Sidebar);
