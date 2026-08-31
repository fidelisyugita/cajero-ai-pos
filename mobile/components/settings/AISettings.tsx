import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import FormSectionCard from "@/components/ui/FormSectionCard";
import { t } from "@/services/i18n";
import { useBusinessStore } from "@/store/useBusinessStore";

const AISettings = () => {
  const _router = useRouter();
  const { business } = useBusinessStore();

  // Subscription Check
  const isUltra = business?.subscriptionStatus === "ultra";

  // Render Upgrade Prompt if not Pro
  if (!isUltra) {
    return (
      <FormSectionCard title={t("ai_settings")} style={{ flex: 1 }} contentStyle={$.container}>
        <View style={$.upgradeContainer}>
          <View style={$.iconContainer}>
            <Feather name="cpu" size={48} color="#2196F3" />
          </View>
          <Text style={$.upgradeTitle}>{t("coming_soon")}</Text>
          <Text style={$.upgradeDescription}>{t("coming_soon_ai_desc")}</Text>
        </View>
      </FormSectionCard>
    );
  }

  return (
    <FormSectionCard
      title={t("artificial_intelligence")}
      style={{ flex: 1 }}
      contentStyle={$.container}
    >
      <ScrollView style={$.section}>
        <View style={$.upgradeContainer}>
          <View style={[$.iconContainer, { backgroundColor: "#E8F5E9" }]}>
            <Feather name="cloud-lightning" size={48} color="#4CAF50" />
          </View>
          <Text style={$.upgradeTitle}>{t("ai_online_active")}</Text>
          <Text style={$.upgradeDescription}>{t("ai_groq_desc")}</Text>

          <View style={$.infoRow}>
            <Feather name="check-circle" size={20} color="green" />
            <Text style={$.infoText}>{t("ai_model_groq")}</Text>
          </View>
        </View>
      </ScrollView>
    </FormSectionCard>
  );
};

const $ = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.md,
  },
  upgradeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.neutral[700],
    textAlign: "center",
  },
  upgradeDescription: {
    ...theme.typography.bodyMd,
    color: theme.colors.neutral[600],
    textAlign: "center",
    maxWidth: 300,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  infoText: {
    ...theme.typography.bodySm,
    color: theme.colors.neutral[700],
    fontWeight: "500",
  },
}));

export default AISettings;
