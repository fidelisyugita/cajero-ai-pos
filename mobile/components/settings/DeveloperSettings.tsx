import { View, Alert, DevSettings } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";
import { db } from "@/db/drizzle";
import { sql } from "drizzle-orm";
import { useAuthStore } from "@/store/useAuthStore";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import FormSectionCard from "@/components/ui/FormSectionCard";

const DeveloperSettings = () => {
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
  const router = useRouter();

  const handleResetDatabase = () => {
    Alert.alert(
      "Reset Database",
      "Are you sure you want to reset the database? All local data will be lost.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              // Close database connection first
              try {
                // @ts-ignore - invalid type definition for close
                await db.$client.close();
              } catch (e) {
                // ignore
              }

              const dbDir = FileSystem.documentDirectory + "SQLite";
              await FileSystem.deleteAsync(dbDir, { idempotent: true });

              Alert.alert("Success", "Database reset complete. Reloading app...", [
                {
                  text: "OK",
                  onPress: () => {
                    setLoggedIn(false);
                    try {
                      DevSettings.reload();
                    } catch (e) {
                      router.replace("/(auth)/sign-in");
                    }
                  },
                },
              ]);
            } catch (error: any) {
              Alert.alert("Error", "Failed to reset database: " + error.message);
              console.error(error);
            }
          },
        },
      ]
    );
  };

  return (
    <FormSectionCard
      title="Developer Options"
      style={{ flex: 1 }}
      contentStyle={$.container}
    >
      <View style={$.section}>
        <Typography variant="bodyMd" style={$.description}>
          Use these options to fix local data issues during development.
        </Typography>

        <View style={$.card}>
          <View style={$.cardHeader}>
            <Typography variant="headingSm">Database</Typography>
          </View>
          <View style={$.cardContent}>
            <Typography variant="bodySm" style={{ marginBottom: 16 }}>
              If you see "missing column" errors, your local database schema is stale. Resetting it will clear local data and fetch fresh data from the server.
            </Typography>
            <Button
              title="Reset Database"
              variant="warning"
              onPress={handleResetDatabase}
            />
          </View>
        </View>
      </View>
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
  description: {
    color: theme.colors.neutral[600],
  },
  card: {
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    overflow: "hidden",
  },
  cardHeader: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.neutral[100],
  },
  cardContent: {
    padding: theme.spacing.md,
  },
}));

export default DeveloperSettings;
