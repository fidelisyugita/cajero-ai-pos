import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, type StyleProp, Text, type TextStyle, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ReceiptPreviewModal from "@/components/printer/ReceiptPreviewModal";
import Button from "@/components/ui/Button";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { t } from "@/services/i18n"; // Assuming translations are available or use keys
import Logger from "@/services/logger";
import { printerService } from "@/services/PrinterService";
import type { ReceiptData, SelectedVariant } from "@/services/types/Receipt";
import type { TransactionProductResponse, TransactionResponse } from "@/services/types/Transaction";
import { formatCustomDate } from "@/utils/Date";
import { formatCurrency } from "@/utils/Format";

const renderRotateCcwIcon = (size: number, color: string) => (
  <Feather name="rotate-ccw" size={size} color={color} />
);

const renderPrinterIcon = (size: number, color: string) => (
  <Feather name="printer" size={size} color={color} />
);

const ReceiptDetailScreen = () => {
  const { transaction: transactionParam } = useLocalSearchParams<{ transaction?: string }>();
  const router = useRouter();

  // Parse transaction from params if available, otherwise we might fail or need fallback (but user insisted on no fetch)
  let transaction: TransactionResponse | null = null;
  try {
    if (transactionParam) {
      transaction = JSON.parse(transactionParam) as TransactionResponse;

      // Ensure selectedVariants is always an array
      if (transaction?.transactionProduct) {
        transaction.transactionProduct = transaction.transactionProduct.map(
          (p: TransactionProductResponse) => {
            let variants = p.selectedVariants;
            if (typeof variants === "string") {
              try {
                variants = JSON.parse(variants) as SelectedVariant[];
              } catch (e) {
                Logger.warn("Failed to parse variants", e);
                variants = [];
              }
            }
            if (!Array.isArray(variants)) {
              variants = [];
            }
            return {
              ...p,
              selectedVariants: variants,
            };
          },
        );
      }

      Logger.log("detail transaction: ", JSON.stringify(transaction, null, 2));
    }
  } catch (e) {
    Logger.error("Failed to parse transaction params", e);
  }

  /* Preview State */
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<ReceiptData | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!transaction) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{t("transaction_not_found")}</Text>
      </View>
    );
  }

  const {
    createdAt,
    statusCode,
    transactionProduct,
    totalPrice,
    totalDiscount,
    totalTax,
    paymentMethodCode,
  } = transaction;

  return (
    <View style={$.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={$.headerWrapper}>
        <ScreenHeader title={t("receipt_details")} />
      </View>

      <ScrollView contentContainerStyle={$.scrollContent}>
        <View style={$.topSection}>
          <View>
            <Text style={$.dateTitle}>{formatCustomDate(createdAt, "ddd D MMM HH:mm")}</Text>
            <Text style={$.subTitle}>
              {t("transaction")} #{transaction.id}
            </Text>
          </View>
          <View
            style={[$.statusBadge, statusCode === "COMPLETED" ? $.statusSuccess : $.statusRefund]}
          >
            <Text style={[$.statusText, statusCode === "COMPLETED" ? $.textSuccess : $.textRefund]}>
              {statusCode}
            </Text>
          </View>
        </View>

        <View style={$.grid}>
          {/* Order List Card - Full Width */}
          <View style={[$.card, { width: "100%" }]}>
            <View style={$.cardHeader}>
              <Text style={$.cardTitle}>{t("order_list")}</Text>
            </View>
            <View style={$.cardContent}>
              {transactionProduct?.map((item: TransactionProductResponse) => {
                const itemVariants = Array.isArray(item.selectedVariants)
                  ? item.selectedVariants
                  : [];
                const itemName = item.name || item.productName || "Item";
                const itemBasePrice = item.sellingPrice ?? item.price ?? 0;
                const variantTotal =
                  itemVariants.reduce((s: number, v: SelectedVariant) => s + (v.price || 0), 0) ||
                  0;
                const itemTotal = (itemBasePrice + variantTotal) * item.quantity;
                return (
                  <View key={item.productId + String(itemBasePrice)} style={$.orderRow}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      {/* i18n-ignore: Multiplier symbol */}
                      <Text style={$.qtyBadge}>{`${item.quantity}x`}</Text>
                      <View>
                        <Text
                          style={$.itemName}
                        >{`${itemName} (${formatCurrency(itemBasePrice)})`}</Text>
                        {itemVariants.map((v: SelectedVariant) => (
                          <Text key={`${v.groupName}-${v.name}`} style={$.itemNote}>
                            + {v.groupName}: {v.name} ({formatCurrency(v.price || 0)})
                          </Text>
                        ))}
                        {item.note && <Text style={$.itemNote}>{item.note}</Text>}
                      </View>
                    </View>
                    <Text style={$.itemPrice}>{formatCurrency(itemTotal)}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Summary Card */}
          <View style={$.card}>
            <View style={$.cardHeader}>
              <Text style={$.cardTitle}>{t("summary")}</Text>
            </View>
            <View style={$.cardContent}>
              <Row
                label={t("subtotal")}
                value={formatCurrency(
                  transactionProduct?.reduce((sum: number, item: TransactionProductResponse) => {
                    const itemVariants = Array.isArray(item.selectedVariants)
                      ? item.selectedVariants
                      : [];
                    const variantTotal = itemVariants.reduce(
                      (s: number, v: SelectedVariant) => s + (v.price || 0),
                      0,
                    );
                    const itemBasePrice = item.sellingPrice ?? item.price ?? 0;
                    return sum + (itemBasePrice + variantTotal) * item.quantity;
                  }, 0) || 0,
                )}
              />
              <Row
                label={t("discount")}
                value={`-${formatCurrency(totalDiscount || 0)}`}
                valueStyle={{ color: "#D32F2F" }} // Red for deductions
              />
              <Row label={t("tax")} value={formatCurrency(totalTax || 0)} />
              <View style={$.divider} />
              <Row
                label={t("total_price")}
                value={formatCurrency(totalPrice)}
                valueStyle={$.totalValue}
              />
            </View>
          </View>

          {/* Payment Info Card */}
          <View style={$.card}>
            <View style={$.cardHeader}>
              <Text style={$.cardTitle}>{t("payment_information")}</Text>
            </View>
            <View style={$.cardContent}>
              <Row label={t("method")} value={paymentMethodCode} />
              <Row
                label={t("customer")}
                value={
                  transaction.description
                    ? transaction.description.split(" - ")[0].replace("Order for ", "")
                    : "-"
                }
              />
              {statusCode === "REFUND" && (
                <>
                  <View style={$.divider} />
                  <Row
                    label={t("refunded_amount")}
                    value={`-${formatCurrency(totalPrice)}`}
                    valueStyle={{ color: "#D32F2F" }}
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={$.footer}>
        {statusCode !== "REFUND" && (
          <Button
            variant="secondary"
            title={t("refund")}
            disabled={true} // Refund workflow is not yet supported by the backend API
            onPress={() => router.back()}
            style={$.footerButton}
            size="lg"
            leftIcon={renderRotateCcwIcon}
          />
        )}
        <Button
          variant="primary"
          title={t("print_receipt")}
          onPress={() => {
            if (!transactionProduct) return;
            const receiptItems = transactionProduct.map((p: TransactionProductResponse) => {
              const pVariants = Array.isArray(p.selectedVariants) ? p.selectedVariants : [];
              const pName = p.name || p.productName || "Item";
              const pPrice = p.sellingPrice ?? p.price ?? 0;
              return {
                name: pName,
                quantity: p.quantity,
                price: formatCurrency(
                  (pPrice +
                    (pVariants.reduce((s: number, v: SelectedVariant) => s + (v.price || 0), 0) ||
                      0)) *
                    p.quantity,
                ),
                variants: pVariants.map((v: SelectedVariant) => ({
                  groupName: v.groupName,
                  name: v.name,
                  price: v.price,
                })),
              };
            });
            const subtotal = transactionProduct.reduce(
              (sum: number, item: TransactionProductResponse) => {
                const itemVariants = Array.isArray(item.selectedVariants)
                  ? item.selectedVariants
                  : [];
                const variantTotal = itemVariants.reduce(
                  (s: number, v: SelectedVariant) => s + (v.price || 0),
                  0,
                );
                const itemBasePrice = item.sellingPrice ?? item.price ?? 0;
                return sum + (itemBasePrice + variantTotal) * item.quantity;
              },
              0,
            );
            setPreviewData({
              title: "RECEIPT / STRUK (COPY)",
              transactionId: transaction?.id ?? "",
              transactionDate: transaction?.createdAt,
              subtotal: formatCurrency(subtotal),
              discount: formatCurrency(totalDiscount || 0),
              tax: formatCurrency(totalTax),
              total: formatCurrency(totalPrice),
              paymentMethod: paymentMethodCode,
              items: receiptItems,
              footerMessage: "Thank you for your visit!",
            });
            setShowPreview(true);
          }}
          style={$.footerButton}
          size="lg"
          leftIcon={renderPrinterIcon}
        />
      </View>

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        onPrint={async () => {
          setIsPrinting(true);
          if (previewData) {
            try {
              await printerService.printReceipt(previewData);
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : String(e);
              Alert.alert(t("print_error"), msg);
            }
          }
          setIsPrinting(false);
          setShowPreview(false);
        }}
        data={previewData ?? { total: "0", items: [] }}
        isPrinting={isPrinting}
      />
    </View>
  );
};

const Row = ({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: StyleProp<TextStyle>;
}) => (
  <View style={$.row}>
    <Text style={$.rowLabel}>{label}</Text>
    <Text style={[$.rowValue, valueStyle]}>{value}</Text>
  </View>
);

const $ = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[100],
  },
  headerWrapper: {
    backgroundColor: theme.colors.neutral[100],
  },
  scrollContent: {
    padding: theme.spacing.xl,
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.xl,
  },
  dateTitle: {
    ...theme.typography.heading3, // Matching Report Details
    color: theme.colors.neutral[700],
  },
  subTitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.neutral[500],
    marginTop: theme.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  statusSuccess: {
    backgroundColor: theme.colors.positive[100],
  },
  statusRefund: {
    backgroundColor: theme.colors.error[100],
  },
  statusText: {
    ...theme.typography.labelMd,
  },
  textSuccess: { color: theme.colors.positive[600] },
  textRefund: { color: theme.colors.error[600] },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: theme.spacing.lg,
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.md,
    overflow: "hidden",
    width: "49%",
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  cardHeader: {
    backgroundColor: theme.colors.sup.red,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  cardTitle: {
    ...theme.typography.heading5,
    color: theme.colors.neutral[700],
  },
  cardContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.neutral[100],
  },

  // Order Row specific
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  qtyBadge: {
    ...theme.typography.labelMd,
    color: theme.colors.neutral[700],
    width: 30,
  },
  itemName: {
    ...theme.typography.bodyMd,
    color: theme.colors.neutral[700],
    fontWeight: "600",
  },
  itemNote: {
    ...theme.typography.bodySm,
    color: theme.colors.neutral[500],
    fontStyle: "italic",
  },
  itemPrice: {
    ...theme.typography.heading5,
    color: theme.colors.neutral[700],
  },

  // Row component styles
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    ...theme.typography.bodyMd,
    color: theme.colors.neutral[600],
  },
  rowValue: {
    ...theme.typography.heading5, // Matching Report Details
    color: theme.colors.neutral[700],
  },
  totalValue: {
    color: theme.colors.primary[400],
    fontSize: 20, // Slightly larger for total
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.neutral[200],
    marginVertical: theme.spacing.xs,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },

  footer: {
    flexDirection: "row",
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.neutral[100],
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
}));

export default ReceiptDetailScreen;
