import Feather from "@expo/vector-icons/Feather";
import { Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { t } from "@/services/i18n";
import { useLanguageStore } from "@/store/useLanguageStore";
import { getAppVersion } from "@/utils/AppInfo";
import { vs } from "@/utils/Scale";

export type SettingsTab = "printers" | "language" | "payment" | "developer" | "ai";

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

type MenuItem = {
  id: SettingsTab;
  labelKey: Parameters<typeof t>[0];
  iconName: keyof typeof Feather.glyphMap;
};

const MENU_ITEMS: MenuItem[] = [
  { id: "printers", labelKey: "printers", iconName: "printer" },
  { id: "language", labelKey: "language", iconName: "globe" },
  // { id: "ai", labelKey: "ai_settings", iconName: "cpu" },   // disabled for now
  ...(__DEV__
    ? ([
        {
          id: "developer",
          labelKey: "developer",
          iconName: "code",
        },
      ] as MenuItem[])
    : []),
];

const SettingsSidebar = ({ activeTab, onTabChange }: SettingsSidebarProps) => {
  // Subscribe to language changes to trigger re-render
  useLanguageStore((state) => state.language);

  return (
    <View style={$.container}>
      <View style={$.menuContainer}>
        {MENU_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[$.menuItem, isActive && $.menuItemActive]}
              onPress={() => onTabChange(item.id)}
            >
              <Feather name={item.iconName} size={20} color={isActive ? "#000" : "#555"} />
              <Text style={[$.menuLabel, isActive && $.menuLabelActive]}>{t(item.labelKey)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={$.footer}>
        <TouchableOpacity style={$.footerLink}>
          <Text style={$.footerText}>{t("help_support")}</Text>
          <Feather name="external-link" size={16} color="#E11D48" />
        </TouchableOpacity>
        <View style={$.versionContainer}>
          <Text style={$.versionLabel}>{t("app_version")}</Text>
          <Text style={$.versionValue}>{getAppVersion()}</Text>
        </View>
      </View>
    </View>
  );
};

const $ = StyleSheet.create((theme) => ({
  container: {
    width: vs(250),
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    // shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // elevation: 2,
    padding: theme.spacing.lg,
    justifyContent: "space-between",
  },
  menuContainer: {
    gap: theme.spacing.xs,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.md,
  },
  menuItemActive: {
    backgroundColor: theme.colors.primary[100],
  },
  menuLabel: {
    ...theme.typography.bodyMd,
    color: theme.colors.neutral[600],
  },
  menuLabelActive: {
    ...theme.typography.labelMd,
    color: theme.colors.primary[500],
  },
  footer: {
    gap: theme.spacing.lg,
  },
  footerLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.neutral[100],
    paddingHorizontal: theme.spacing.xs,
  },
  footerText: {
    ...theme.typography.bodyMd,
    color: theme.colors.neutral[700],
  },
  versionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xs,
  },
  versionLabel: {
    ...theme.typography.bodySm,
    color: theme.colors.neutral[500],
  },
  versionValue: {
    ...theme.typography.bodySm,
    color: theme.colors.neutral[500],
  },
}));

export default SettingsSidebar;
