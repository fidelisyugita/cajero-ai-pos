import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { StyleSheet } from "react-native-unistyles";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/utils/Format";
import dayjs from "dayjs";
import { Feather } from "@expo/vector-icons";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { t } from "@/services/i18n"; // Assuming translations are available or use keys
import { printerService } from "@/services/PrinterService";
import { Alert } from "react-native";
import ReceiptPreviewModal from "@/components/printer/ReceiptPreviewModal";
import { useState } from "react";
import Logger from "@/services/logger";

const ReceiptDetailScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Parse transaction from params if available, otherwise we might fail or need fallback (but user insisted on no fetch)
  let transaction: any = null;
  try {
    if (params.transaction) {
      transaction = JSON.parse(params.transaction as string);
      Logger.log('transaction: ', transaction);

    }
  } catch (e) {
    Logger.error("Failed to parse transaction params", e);
  }

  if (!transaction) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Transaction not found</Text>
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
    paymentMethodCode
  } = transaction;

  /* Preview State */
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  return (
    <View style={$.container}>
      <Stack.Screen
        options={{
          headerShown: false
        }}
      />

      <View style={$.headerWrapper}>
        <ScreenHeader title="Receipt Details" />
      </View>

      <ScrollView contentContainerStyle={$.scrollContent}>
        <View style={$.topSection}>
          <View>
            <Text style={$.dateTitle}>{dayjs(createdAt).format("ddd D MMM hh:mm")}</Text>
            <Text style={$.subTitle}>Transaction #{transaction.id}</Text>
          </View>
          <View style={[$.statusBadge, statusCode === "COMPLETED" ? $.statusSuccess : $.statusRefund]}>
            <Text style={[$.statusText, statusCode === "COMPLETED" ? $.textSuccess : $.textRefund]}>
              {statusCode}
            </Text>
          </View>
        </View>

        <View style={$.grid}>
          {/* Order List Card - Full Width */}
          <View style={[$.card, { width: '100%' }]}>
            <View style={$.cardHeader}>
              <Text style={$.cardTitle}>Order List</Text>
            </View>
            <View style={$.cardContent}>
              {transactionProduct?.map((item: any, index: number) => (
                <View key={index} style={$.orderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={$.qtyBadge}>{item.quantity}x</Text>
                    <View>
                      <Text style={$.itemName}>{item.productName}</Text>
                      {item.note && <Text style={$.itemNote}>{item.note}</Text>}
                    </View>
                  </View>
                  <Text style={$.itemPrice}>{formatCurrency(item.sellingPrice * item.quantity)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Summary Card */}
          <View style={$.card}>
            <View style={$.cardHeader}>
              <Text style={$.cardTitle}>Summary</Text>
            </View>
            <View style={$.cardContent}>
              <Row label="Subtotal" value={formatCurrency(transactionProduct?.reduce((sum: number, item: any) => sum + (item.sellingPrice * item.quantity), 0) || 0)} />
              <Row
                label="Discount"
                value={`-${formatCurrency(totalDiscount || 0)}`}
                valueStyle={{ color: '#D32F2F' }} // Red for deductions
              />
              <Row label="Tax" value={formatCurrency(totalTax || 0)} />
              <View style={$.divider} />
              <Row
                label="Total Price"
                value={formatCurrency(totalPrice)}
                valueStyle={$.totalValue}
              />
            </View>
          </View>

          {/* Payment Info Card */}
          <View style={$.card}>
            <View style={$.cardHeader}>
              <Text style={$.cardTitle}>Payment Information</Text>
            </View>
            <View style={$.cardContent}>
              <Row label="Method" value={paymentMethodCode} />
              <Row label="Customer" value={transaction.description ? transaction.description.split(" - ")[0].replace("Order for ", "") : "-"} />
              {statusCode === "REFUND" && (
                <>
                  <View style={$.divider} />
                  <Row label="Refunded Amount" value={`-${formatCurrency(totalPrice)}`} valueStyle={{ color: '#D32F2F' }} />
                </>
              )}
            </View>
          </View>

        </View>
      </ScrollView >

      {/* Footer */}
      < View style={$.footer} >
        {statusCode !== "REFUND" && (
          <Button
            variant="secondary"
            title={t("refund")}
            disabled={true} // TODO: implement refund
            onPress={() => router.back()}
            style={$.footerButton}
            size="lg"
            leftIcon={(size, color) => <Feather name="rotate-ccw" size={size} color={color} />}
          />
        )}
        <Button
          variant="primary"
          title={t("print_receipt")}
          onPress={() => {
            setPreviewData({
              title: "RECEIPT / STRUK (COPY)",
              transactionId: transaction.id || "",
              transactionDate: transaction.createdAt,
              subtotal: formatCurrency(transactionProduct?.reduce((sum: number, item: any) => sum + (item.sellingPrice * item.quantity), 0) || 0),
              discount: formatCurrency(totalDiscount || 0),
              tax: formatCurrency(totalTax),
              total: formatCurrency(totalPrice),
              paymentMethod: paymentMethodCode,
              items: transactionProduct?.map((p: any) => ({
                name: p.productName,
                quantity: p.quantity,
                price: formatCurrency(p.sellingPrice * p.quantity)
              })) || [],
              footerMessage: "Thank you for your visit!"
            });
            setShowPreview(true);
          }}
          style={$.footerButton}
          size="lg"
          leftIcon={(size, color) => <Feather name="printer" size={size} color={color} />}
        />
      </View >

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        onPrint={async () => {
          setIsPrinting(true);
          if (previewData) {
            try {
              await printerService.printReceipt({
                title: previewData.title,
                total: previewData.total,
                items: previewData.items.map((i: any) => ({
                  name: i.name,
                  quantity: i.quantity,
                  price: i.price
                })),
                subtotal: previewData.subtotal,
                discount: previewData.discount,
                tax: previewData.tax,
                paymentMethod: previewData.paymentMethod,
                footerMessage: previewData.footerMessage
              });
            } catch (e: any) {
              Alert.alert(t("print_error"), e.message);
            }
          }
          setIsPrinting(false);
          setShowPreview(false);
        }}
        data={previewData || { total: "0", items: [] }}
        isPrinting={isPrinting}
      />
    </View >
  );
};

const Row = ({ label, value, valueStyle }: { label: string, value: string, valueStyle?: any }) => (
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    width: '49%',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: '600',
  },
  itemNote: {
    ...theme.typography.bodySm,
    color: theme.colors.neutral[500],
    fontStyle: 'italic',
  },
  itemPrice: {
    ...theme.typography.heading5,
    color: theme.colors.neutral[700],
  },

  // Row component styles
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },

  footer: {
    flexDirection: 'row',
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
