import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Typography from "@/components/ui/Typography";
import { useSyncStore } from "@/store/useSyncStore";

const SyncIndicator = () => {
  const { isSyncing } = useSyncStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isSyncing) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Delay fade out slightly
      timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSyncing, fadeAnim]);

  return (
    <Animated.View
      style={[$.container, { opacity: fadeAnim }]}
      pointerEvents="none"
      testID="sync-indicator"
    >
      <View style={$.content}>
        <ActivityIndicator color="white" size="small" testID="sync-spinner" />
        <Typography color="white" variant="bodySm">
          Syncing...
        </Typography>
      </View>
    </Animated.View>
  );
};

const $ = StyleSheet.create((theme) => ({
  container: {
    position: "absolute",
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    zIndex: 9999,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.neutral[700],
    borderRadius: theme.radius.full,
    gap: theme.spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
}));

export default SyncIndicator;
