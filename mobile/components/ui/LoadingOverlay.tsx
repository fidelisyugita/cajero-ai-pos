import { ActivityIndicator, Modal, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useLoadingStore } from "../../store/useLoadingStore";

const LoadingOverlay = () => {
  const isLoading = useLoadingStore(state => state.isLoading);

  return (
    <Modal
      animationType="fade"
      statusBarTranslucent
      transparent
      visible={isLoading}
    >
      <View style={$.overlay}>
        <View style={$.container}>
          <ActivityIndicator color="white" size="large" />
        </View>
      </View>
    </Modal>
  );
}

const $ = StyleSheet.create(theme => ({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.transparentModal,
    justifyContent: "center",
    alignItems: "center",
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

export default LoadingOverlay;
