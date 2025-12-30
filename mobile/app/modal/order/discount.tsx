import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { StyleSheet as UnistylesSheet } from "react-native-unistyles";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ScreenModal from "@/components/ui/ScreenModal";
import { t } from "@/services/i18n";
import { useBusinessStore } from "@/store/useBusinessStore";
import { selectSubtotal, useOrderStore } from "@/store/useOrderStore";
import { formatCurrency } from "@/utils/Format";
import { vs } from "@/utils/Scale";

const DiscountModal = () => {
  const router = useRouter();
  const discount = useOrderStore((state) => state.discount);
  const setDiscount = useOrderStore((state) => state.setDiscount);
  const items = useOrderStore((state) => state.items);
  const business = useBusinessStore((state) => state.business);
  const maxDiscountPercent = business?.maxDiscount ?? 10;

  // Calculate subtotal to validate discount
  // Note: selectSubtotal calculates (price + variantPrice) * quantity
  // It does NOT account for item-level discounts.
  // We should subtract item discounts to get the true "subtotal before global discount"
  const subtotal = selectSubtotal(items);
  const totalItemDiscounts = items.reduce(
    (sum, item) => sum + (item.discount || 0),
    0,
  );
  const currentTotal = subtotal - totalItemDiscounts;
  const maxAmount = currentTotal * (maxDiscountPercent / 100);

  const [value, setValue] = useState(discount > 0 ? String(discount) : "");

  const handleSave = () => {
    const amount = Number(value);

    if (isNaN(amount) || amount < 0) {
      Alert.alert(t("error"), t("invalid_amount"));
      return;
    }

    if (amount > maxAmount) {
      Alert.alert(t("error"), t("discount_exceeds_price"));
      return;
    }

    setDiscount(amount);
    router.back();
  };

  return (
    <ScreenModal modalStyle={$.modal}>
      <ScreenModal.Header title={t("add_discount")} />
      <ScreenModal.Body>
        <View style={$.container}>
          <Input
            label={t("discount_amount")}
            placeholder="0"
            value={value}
            onChangeText={(text) => {
              const numericValue = Number(text);
              if (text === "" || (numericValue >= 0 && numericValue <= maxAmount)) {
                setValue(text);
              } else {
                // Optional: visual feedback or just prevent update
              }
            }}
            keyboardType="numeric"
            size="lg"
            autoFocus
          />
          <Text style={$.hint}>
            {t("max_discount")}: {formatCurrency(maxAmount)} ({maxDiscountPercent}%)
          </Text>
        </View>
      </ScreenModal.Body>
      <ScreenModal.Footer>
        <Button
          title={t("save_changes")}
          onPress={handleSave}
          size="lg"
          variant="primary"
          style={$.button}
        />
      </ScreenModal.Footer>
    </ScreenModal>
  );
};

const $ = UnistylesSheet.create((theme) => ({
  modal: {
    width: vs(400),
    minHeight: vs(300),
    height: "auto",
  },
  container: {
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.neutral[100],
  },
  hint: {
    ...theme.typography.bodySm,
    color: theme.colors.neutral[500],
  },
  button: {
    flex: 1,
  },
}));

export default DiscountModal;
