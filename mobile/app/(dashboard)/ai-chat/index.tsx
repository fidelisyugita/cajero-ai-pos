import { View, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ChatInterface from "@/components/ai/ChatInterface";
import Header from "@/components/dashboard/Header";
import { t } from "@/services/i18n";

const AIChatScreen = () => {
  return (
    <View style={$.container}>
      <Header>
        <Text style={$.headerTitle}>{t("ai_settings")}</Text>
      </Header>
      <View style={$.content}>
        <ChatInterface />
      </View>
    </View>
  );
};

const $ = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[100],
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.heading3,
    color: theme.colors.neutral[700], // Adjust to valid color
  },
}));

export default AIChatScreen;
