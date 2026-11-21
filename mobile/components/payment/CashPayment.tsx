import { memo, useCallback, useMemo, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcBackspace from "@/assets/icons/backspace.svg";
import Button from "@/components/ui/Button";
import colors from "@/tokens/Colors";
import { formatCurrency } from "@/utils/Format";
import { vs } from "@/utils/Scale";

interface CashPaymentProps {
  totalAmount: number;
  paidAmount: number;
  onChangePaidAmount: (amount: number) => void;
  onPay: () => void;
  isProcessing?: boolean;
}

type NumpadValue = number | "C" | "X";

const NUMPAD_KEYS: readonly NumpadValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0, "X"];

const MemoButton = memo(Button);

interface QuickAmountButtonProps {
  amount: number;
  isExact: boolean;
  onSelect: (amount: number) => void;
}

const QuickAmountButton = memo(({ amount, isExact, onSelect }: QuickAmountButtonProps) => {
  const handlePress = useCallback(() => {
    onSelect(amount);
  }, [onSelect, amount]);

  return (
    <TouchableOpacity style={$.quickButton} onPress={handlePress}>
      <Text style={$.quickButtonText}>{isExact ? "Exact" : formatCurrency(amount)}</Text>
    </TouchableOpacity>
  );
});

interface NumpadKeyProps {
  value: NumpadValue;
  onPress: (value: NumpadValue) => void;
}

const NumpadKey = memo(({ value, onPress }: NumpadKeyProps) => {
  const handlePress = useCallback(() => {
    onPress(value);
  }, [onPress, value]);

  return (
    <TouchableOpacity style={$.key} onPress={handlePress} activeOpacity={0.7}>
      {value === "X" ? (
        <IcBackspace width={vs(32)} height={vs(32)} color={colors.error[500]} />
      ) : (
        <Text style={value === "C" ? $.clearKeyText : $.keyText}>{value}</Text>
      )}
    </TouchableOpacity>
  );
});

const quickAmounts = (total: number) => {
  // Logic to suggest amounts: Exact, Next 50k, Next 100k, etc.
  // For simple logic: Exact, + some fixed values or just commonly used notes
  // Let's implement static logic for now similar to design
  // Ideally this should be dynamic based on total
  // E.g. Total 124.650 -> Exact, 125.000, 150.000, 200.000

  // Simple rounding up next 5k, 10k, 50k, 100k
  const next5k = Math.ceil(total / 5000) * 5000;
  const next10k = Math.ceil(total / 10000) * 10000;
  const next50k = Math.ceil(total / 50000) * 50000;
  const next100k = Math.ceil(total / 100000) * 100000;

  const amounts = [total];
  if (next5k > total) amounts.push(next5k);
  if (next10k > total && !amounts.includes(next10k)) amounts.push(next10k);
  if (next50k > total && !amounts.includes(next50k)) amounts.push(next50k);
  if (next100k > total && !amounts.includes(next100k)) amounts.push(next100k);

  // Ensure 4 items max
  return amounts.slice(0, 4);
};

const CashPayment = ({
  totalAmount,
  paidAmount,
  onChangePaidAmount,
  onPay,
  isProcessing,
}: CashPaymentProps) => {
  const change = Math.max(0, paidAmount - totalAmount);
  const suggestions = useMemo(() => quickAmounts(totalAmount), [totalAmount]);
  const chargeText = useMemo(() => `Charge ${formatCurrency(totalAmount)}`, [totalAmount]);

  // Ref keeps handleNumPad stable across keystrokes without changing the number prop API
  const paidAmountRef = useRef(paidAmount);
  paidAmountRef.current = paidAmount;

  const handleNumPad = useCallback(
    (value: NumpadValue) => {
      if (value === "C") {
        paidAmountRef.current = 0;
        onChangePaidAmount(0);
        return;
      }

      const current = paidAmountRef.current;
      if (value === "X") {
        const str = current.toString();
        const nextAmount = str.length > 1 ? Number(str.slice(0, -1)) : 0;
        paidAmountRef.current = nextAmount;
        onChangePaidAmount(nextAmount);
        return;
      }

      const currentStr = current === 0 ? "" : current.toString();
      const newStr = currentStr + value.toString();
      if (newStr.length < 12) {
        const nextAmount = Number(newStr);
        paidAmountRef.current = nextAmount;
        onChangePaidAmount(nextAmount);
      }
    },
    [onChangePaidAmount],
  );

  return (
    <View style={$.container}>
      <View style={$.header}>
        <Text style={$.chargeLabel}>{chargeText}</Text>
      </View>

      <View style={$.quickAmounts}>
        {suggestions.map((amt, index) => (
          <QuickAmountButton
            key={amt}
            amount={amt}
            isExact={index === 0}
            onSelect={onChangePaidAmount}
          />
        ))}
      </View>

      <View style={$.paymentInfoRow}>
        <View style={$.amountBlock}>
          <Text style={$.amountLabel}>Paid</Text>
          <Text style={$.amountValue}>{formatCurrency(paidAmount)}</Text>
        </View>

        {change > 0 && (
          <View style={$.changeBlock}>
            <Text style={$.changeLabel}>Change</Text>
            <Text style={$.changeValue}>{formatCurrency(change)}</Text>
          </View>
        )}
      </View>

      <View style={$.numpad}>
        {NUMPAD_KEYS.map((key) => (
          <NumpadKey key={key} value={key} onPress={handleNumPad} />
        ))}
      </View>

      <MemoButton
        title="Pay"
        size="lg"
        variant="primary"
        onPress={onPay}
        isLoading={isProcessing}
        disabled={paidAmount < totalAmount}
      />
    </View>
  );
};

const $ = StyleSheet.create((theme) => ({
  container: {
    flex: 1.5, // Takes more space on right
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.lg,
    // shadow
    shadowColor: "#000",
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    backgroundColor: theme.colors.primary[100],
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: "center",
  },
  chargeLabel: {
    ...theme.typography.heading3,
    color: theme.colors.neutral[700], // Assuming dark text
  },
  quickAmounts: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  quickButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    alignItems: "center",
  },
  quickButtonText: {
    ...theme.typography.bodySm,
    color: theme.colors.neutral[700],
  },
  paymentInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: vs(50), // Reserve space to avoid jumping
  },
  amountBlock: {
    flex: 1,
    gap: 2,
  },
  changeBlock: {
    flex: 1,
    gap: 2,
    alignItems: "flex-end",
  },
  amountLabel: {
    ...theme.typography.bodySm,
    color: theme.colors.neutral[500],
  },
  amountValue: {
    ...theme.typography.heading3,
    color: theme.colors.neutral[700],
  },
  changeLabel: {
    ...theme.typography.bodySm,
    color: theme.colors.success[600],
  },
  changeValue: {
    ...theme.typography.heading3,
    color: theme.colors.success[600],
  },
  numpad: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
    justifyContent: "center",
  },
  key: {
    width: "30%",
    height: vs(80),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.neutral[100],
    borderWidth: 1,
    borderColor: theme.colors.neutral[100],
    borderRadius: theme.radius.md,
  },
  keyText: {
    ...theme.typography.heading3,
    color: theme.colors.neutral[700],
  },
  clearKeyText: {
    ...theme.typography.heading3,
    color: theme.colors.sup.yellow, // Or warning color
  },
}));

export default memo(CashPayment);
