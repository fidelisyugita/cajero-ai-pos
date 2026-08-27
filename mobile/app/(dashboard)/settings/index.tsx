import { useState } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Header from "@/components/dashboard/Header";
import AISettings from "@/components/settings/AISettings";
import DeveloperSettings from "@/components/settings/DeveloperSettings";
import LanguageSettings from "@/components/settings/LanguageSettings";
import PrinterSettings from "@/components/settings/PrinterSettings";
import SettingsSidebar, { type SettingsTab } from "@/components/settings/SettingsSidebar";
import { t } from "@/services/i18n";
import { useLanguageStore } from "@/store/useLanguageStore";

const SettingsScreen = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("printers");
  // Ensure re-render on language change
  useLanguageStore((state) => state.language);

  return (
    <View style={$.container}>
      <Header>
        <Text style={$.headerTitle}>{t("settings")}</Text>
      </Header>
      <View style={$.content}>
        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <View style={$.mainArea}>
          {activeTab === "printers" && <PrinterSettings />}
          {activeTab === "language" && <LanguageSettings />}
          {activeTab === "ai" && <AISettings />}
          {activeTab === "developer" && <DeveloperSettings />}
        </View>
      </View>
    </View>
  );
};

const $ = StyleSheet.create((theme, _rt) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[200],
  },
  content: {
    flex: 1,
    flexDirection: "row",
    padding: theme.spacing.xl,
    paddingTop: 0,
    gap: theme.spacing.xl,
  },
  mainArea: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.lg,
  },
  headerTitle: {
    ...theme.typography.heading3,
    color: theme.colors.neutral[700],
  },
}));

export default SettingsScreen;
