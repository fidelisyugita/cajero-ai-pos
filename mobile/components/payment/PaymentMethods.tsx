import { memo, useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { t } from "@/services/i18n";
import { useReferenceStore } from "@/store/useReferenceStore";

interface PaymentMethodsProps {
  selectedMethod: string;
  onSelect: (method: string) => void;
}

interface PaymentMethodItemProps {
  code: string;
  name: string;
  isSelected: boolean;
  onSelect: (method: string) => void;
}

const PaymentMethodItem = memo(({ code, name, isSelected, onSelect }: PaymentMethodItemProps) => {
  const handlePress = useCallback(() => {
    onSelect(code);
  }, [onSelect, code]);

  return (
    <TouchableOpacity
      style={isSelected ? $.selectedCard : $.methodCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={isSelected ? $.selectedLabel : $.methodLabel}>{name}</Text>
    </TouchableOpacity>
  );
});

const PaymentMethods = memo(({ selectedMethod, onSelect }: PaymentMethodsProps) => {
  const methods = useReferenceStore((state) => state.paymentMethods);

  return (
    <View style={$.container}>
      <Text style={$.title}>{t("select_payment_method")}</Text>
      <View style={$.list}>
        {methods.map((method) => (
          <PaymentMethodItem
            key={method.code}
            code={method.code}
            name={method.name}
            isSelected={selectedMethod === method.code}
            onSelect={onSelect}
          />
        ))}
      </View>
    </View>
  );
});

const $ = StyleSheet.create((theme) => {
  const methodCard = {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: theme.colors.neutral[100],
  };

  const methodLabel = {
    ...theme.typography.heading5,
    color: theme.colors.neutral[600],
  };

  return {
    container: {
      flex: 1,
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
      backgroundColor: theme.colors.neutral[100],
      borderRadius: theme.radius.lg,
      shadowColor: "#000",
      shadowOffset: { height: 0, width: 0 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    title: {
      ...theme.typography.heading4,
      color: theme.colors.neutral[700],
    },
    list: {
      gap: theme.spacing.md,
    },
    methodCard,
    selectedCard: {
      ...methodCard,
      backgroundColor: theme.colors.primary[100],
      borderColor: theme.colors.primary[500],
    },
    methodLabel,
    selectedLabel: {
      ...methodLabel,
      color: theme.colors.primary[600],
    },
  };
});

export default PaymentMethods;
