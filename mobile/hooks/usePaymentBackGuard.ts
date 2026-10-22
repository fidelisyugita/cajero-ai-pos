import { useEffect } from "react";
import { Alert, BackHandler } from "react-native";
import { t } from "@/services/i18n";

export interface UsePaymentBackGuardProps {
  isPending: boolean;
  isSuccess: boolean;
  hasActiveItems: boolean;
  onNewTransaction: () => void;
  onExit: () => void;
}

function promptExitConfirmation(onExit: () => void) {
  const title = t("cancel_payment_title") || "Exit Checkout";
  const message = t("cancel_payment_message") || "Are you sure you want to return to the menu?";
  const cancelText = t("cancel") || "Cancel";
  const exitText = t("exit") || "Exit";

  Alert.alert(title, message, [
    { text: cancelText, style: "cancel" },
    { text: exitText, style: "destructive", onPress: onExit },
  ]);
}

export const usePaymentBackGuard = ({
  isPending,
  isSuccess,
  hasActiveItems,
  onNewTransaction,
  onExit,
}: UsePaymentBackGuardProps) => {
  useEffect(() => {
    const handleHardwareBack = () => {
      if (isPending) {
        return true;
      }

      if (isSuccess) {
        onNewTransaction();
        return true;
      }

      if (hasActiveItems) {
        promptExitConfirmation(onExit);
        return true;
      }

      return false;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", handleHardwareBack);
    return () => subscription.remove();
  }, [isPending, isSuccess, hasActiveItems, onNewTransaction, onExit]);
};
