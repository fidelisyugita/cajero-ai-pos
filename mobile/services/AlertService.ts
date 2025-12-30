import { Alert } from "react-native";

export type RNAlertButton = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

export type RNAlertOptions = {
  cancelable?: boolean;
  onDismiss?: () => void;
};

export type ConfirmOptions = RNAlertOptions & {
  confirmText?: string;
  cancelText?: string;
};

export class AlertService {
  show(
    title: string,
    message?: string,
    buttons?: RNAlertButton[],
    options?: RNAlertOptions,
  ) {
    Alert.alert(title, message, buttons, options);
  }

  info(title: string, message?: string, options?: RNAlertOptions) {
    this.show(title, message, [{ text: "OK" }], options);
  }

  success(title: string, message?: string, options?: RNAlertOptions) {
    this.show(title, message, [{ text: "OK" }], options);
  }

  warning(title: string, message?: string, options?: RNAlertOptions) {
    this.show(title, message, [{ text: "OK" }], options);
  }

  error(title: string, message?: string, options?: RNAlertOptions) {
    this.show(title, message, [{ text: "OK", style: "destructive" }], options);
  }

  confirm(title: string, message?: string, options?: ConfirmOptions): Promise<boolean> {
    const { confirmText = "OK", cancelText = "Cancel", cancelable, onDismiss } = options || {};
    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          { text: cancelText, style: "cancel", onPress: () => resolve(false) },
          { text: confirmText, onPress: () => resolve(true) },
        ],
        { cancelable, onDismiss },
      );
    });
  }
}

const alertService = new AlertService();

export default alertService;
