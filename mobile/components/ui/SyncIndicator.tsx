import { View, ActivityIndicator, Animated } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useSyncStore } from "@/store/useSyncStore";
import Typography from "@/components/ui/Typography";
import { useEffect, useRef, useState } from "react";
import { vs } from "@/utils/Scale";

const SyncIndicator = () => {
  const { isSyncing } = useSyncStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSyncing) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Delay fade out slightly
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 1000);
    }
  }, [isSyncing]);

  if (!isSyncing && fadeAnim._value === 0) return null; // Optimization? Need to check if _value usage is safe or use state.
  // Actually pointerEvents="none" on container when opacity is 0 is better if we keep it mounted.

  return (
    <Animated.View style={[$.container, { opacity: fadeAnim }]} pointerEvents="none">
      <View style={$.content}>
        <ActivityIndicator size="small" color="white" />
        <Typography variant="bodySm" color="white">
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
    backgroundColor: theme.colors.neutral[800],
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
