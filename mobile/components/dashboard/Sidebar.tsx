import { type Href, usePathname, useRouter } from "expo-router";
import { type FC, memo, useCallback, useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { SvgProps } from "react-native-svg";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import IcSignOut from "@/assets/icons/sign-out.svg";
import Logo from "@/assets/images/logo.svg";
import { LogoutService } from "@/services/LogoutService";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { vs } from "@/utils/Scale";
import { LIST_SIDEBAR_ITEMS } from "./Sidebar.cons";
import SidebarItem from "./SidebarItem";

const LOGO_SIZE = vs(80);
const SIGN_OUT_ICON_SIZE = vs(26);

const UniIcSignOut = withUnistyles(IcSignOut, (theme) => ({
  color: theme.colors.error[400],
}));

const SidebarLogo = memo(() => <Logo height={LOGO_SIZE} width={LOGO_SIZE} />);

const handleSignOut = () => {
  LogoutService.performSafeLogout();
};

const SidebarSignOutButton = memo(() => (
  <TouchableOpacity style={$.signOutButton} onPress={handleSignOut}>
    <UniIcSignOut height={SIGN_OUT_ICON_SIZE} width={SIGN_OUT_ICON_SIZE} />
    <Text adjustsFontSizeToFit numberOfLines={1} style={$.signOut}>
      Sign Out
    </Text>
  </TouchableOpacity>
));

interface ConnectedSidebarItemProps {
  Icons: FC<SvgProps>[];
  label: string;
  path: string;
  onPress: (path?: string) => void;
}

const ConnectedSidebarItem = memo(({ Icons, label, path, onPress }: ConnectedSidebarItemProps) => {
  const pathname = usePathname();
  const comparedPath = useMemo(() => path.replace("/(dashboard)", ""), [path]);
  const isActive = pathname === comparedPath || (comparedPath === "" && pathname === "/");

  return (
    <SidebarItem Icons={Icons} isActive={isActive} label={label} onPress={onPress} path={path} />
  );
});

const Sidebar = memo(() => {
  const router = useRouter();
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

  return (
    <View style={$.container}>
      <SidebarLogo />
      <ScrollView
        bounces={false}
        contentContainerStyle={$.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={$.sidebarItems}>
          {visibleTabs.map((tab) => (
            <ConnectedSidebarItem
              Icons={tab.Icon}
              key={tab.label}
              label={tab.label}
              onPress={handleNavigate}
              path={tab.path}
            />
          ))}
        </View>
      </ScrollView>
      <SidebarSignOutButton />
    </View>
  );
});

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
