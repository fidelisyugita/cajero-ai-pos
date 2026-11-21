import { memo } from "react";
import { ActivityIndicator, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useLoadingStore } from "../../store/useLoadingStore";

const LoadingOverlay = () => {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) {
    return null;
  }

  return (
    <View pointerEvents="auto" style={$.overlay} testID="loading-overlay-modal">
      <View style={$.container}>
        <ActivityIndicator color="white" size="large" testID="loading-indicator" />
      </View>
    </View>
  );
};

const $ = StyleSheet.create((theme) => ({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.transparentModal,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
    elevation: 999,
  },
  container: {
    borderRadius: 12,
    padding: 24,
    minWidth: 100,
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
  },
}));

export default memo(LoadingOverlay);
