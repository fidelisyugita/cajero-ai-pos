import React from "react";
import { View, Text, Modal, ScrollView, StyleSheet as RNStyleSheet, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Button from "@/components/ui/Button";
import { t } from "@/services/i18n";
import { useBusinessStore } from "@/store/useBusinessStore";
import { formatCurrency } from "@/utils/Format";
import dayjs from "dayjs";
import { Feather } from "@expo/vector-icons";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: string | number; // pre-formatted or number
  variants?: { groupName: string; name: string; price: number }[];
}

interface ReceiptPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  onPrint: () => void;
  data: {
    title?: string;
    subtotal?: string;
    discount?: string;
    tax?: string;
    total: string;
    items: ReceiptItem[];
    paymentMethod?: string;
    footerMessage?: string;
    transactionDate?: string | Date;
    transactionId?: string;
  };
  isPrinting?: boolean;
}

const ReceiptPreviewModal = ({ visible, onClose, onPrint, data, isPrinting }: ReceiptPreviewModalProps) => {
  const business = useBusinessStore((state) => state.business);

  // Fallback/Default values
  const businessName = business?.name || "CAJERO POS";
  const address = business?.address || "No Address Provided";
  const phone = business?.phone || "-";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={$.overlay}>
        <View style={$.container}>
          {/* Header */}
          <View style={$.header}>
            <Text style={$.headerTitle}>{t("print_preview")}</Text>
            <TouchableOpacity onPress={onClose} style={$.closeButton}>
              <Feather name="x" size={24} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Receipt Preview Area directly mimicking thermal paper */}
          <ScrollView contentContainerStyle={$.scrollContent}>
            <View style={$.receiptPaper}>

              {/* Business Header */}
              <View style={$.receiptHeader}>
                <Text style={$.receiptBusinessName}>{businessName}</Text>
                <Text style={$.receiptText}>{address}</Text>
                <Text style={$.receiptText}>{phone}</Text>
                <View style={$.dashLine} />
                <Text style={$.receiptTitle}>{data.title || "RECEIPT"}</Text>
                <Text style={$.receiptText}>{dayjs(data.transactionDate || new Date()).format("DD/MM/YYYY HH:mm")}</Text>
                {data.transactionId && <Text style={$.receiptText}>#{data.transactionId}</Text>}
                <View style={$.dashLine} />
              </View>

              {/* Items */}
              <View style={$.itemsContainer}>
                {data.items.map((item, index) => (
                  <View key={index} style={$.itemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={$.itemText}>{item.name}</Text>
                      {item.variants && item.variants.length > 0 && (
                        <View style={{ paddingLeft: 8 }}>
                          {item.variants.map((v, i) => (
                            <Text key={i} style={$.itemSubText}>+ {v.groupName}: {v.name} ({formatCurrency(v.price)})</Text>
                          ))}
                        </View>
                      )}
                      {item.quantity > 1 && (
                        <Text style={$.itemSubText}>{item.quantity} x {typeof item.price === 'number' ? formatCurrency(item.price / item.quantity) : ''}</Text>
                      )}
                    </View>
                    <Text style={$.itemText}>
                      {typeof item.price === 'number' ? formatCurrency(item.price) : item.price}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={$.dashLine} />

              {/* Totals */}
              <View style={$.totalsContainer}>
                {data.subtotal && (
                  <View style={$.totalRow}>
                    <Text style={$.receiptText}>Subtotal</Text>
                    <Text style={$.receiptText}>{data.subtotal}</Text>
                  </View>
                )}
                {data.discount && (
                  <View style={$.totalRow}>
                    <Text style={$.receiptText}>Discount</Text>
                    <Text style={$.receiptText}>{data.discount}</Text>
                  </View>
                )}
                {data.tax && (
                  <View style={$.totalRow}>
                    <Text style={$.receiptText}>Tax</Text>
                    <Text style={$.receiptText}>{data.tax}</Text>
                  </View>
                )}
                <View style={[$.dashLine, { marginVertical: 8 }]} />
                <View style={$.totalRow}>
                  <Text style={[$.receiptText, { fontWeight: 'bold', fontSize: 16 }]}>TOTAL</Text>
                  <Text style={[$.receiptText, { fontWeight: 'bold', fontSize: 16 }]}>{data.total}</Text>
                </View>
                {data.paymentMethod && (
                  <View style={[$.totalRow, { marginTop: 4 }]}>
                    <Text style={$.receiptText}>Payment</Text>
                    <Text style={$.receiptText}>{data.paymentMethod}</Text>
                  </View>
                )}
              </View>

              <View style={$.dashLine} />

              {/* Footer */}
              <View style={$.receiptFooter}>
                <Text style={$.receiptText}>{data.footerMessage || "Thank you!"}</Text>
              </View>

            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={$.footer}>
            <Button
              title={t("cancel")}
              variant="neutral"
              size="lg"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <Button
              title={isPrinting ? t("printing") : t("print")}
              variant="primary"
              size="lg"
              onPress={onPrint}
              isLoading={isPrinting}
              style={{ flex: 1 }}
              leftIcon={(size, color) => <Feather name="printer" size={size} color={color} />}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const $ = StyleSheet.create((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  container: {
    backgroundColor: theme.colors.neutral[100],
    width: "100%",
    maxWidth: 400,
    borderRadius: theme.radius.lg,
    height: "80%", // Fixed height for scrolling
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  headerTitle: {
    ...theme.typography.heading5,
    color: theme.colors.neutral[700],
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },

  // Thermal Receipt Styling
  receiptPaper: {
    backgroundColor: "#fff",
    padding: theme.spacing.lg,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    // Min width roughly 58mm scaled visually
  },
  receiptHeader: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  receiptBusinessName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
    color: '#000',
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 4,
    color: '#000',
  },
  receiptText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    fontFamily: 'monospace', // Monospace for alignment look
  },
  dashLine: {
    width: "100%",
    height: 1,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#333',
    marginVertical: 8,
  },
  itemsContainer: {
    width: "100%",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemText: {
    fontSize: 12,
    color: "#333",
    fontFamily: 'monospace',
  },
  itemSubText: {
    fontSize: 10,
    color: "#666",
    fontFamily: 'monospace',
  },
  totalsContainer: {
    width: "100%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  receiptFooter: {
    alignItems: "center",
    marginTop: 8,
  },

  footer: {
    flexDirection: "row",
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    gap: theme.spacing.md,
    backgroundColor: theme.colors.neutral[100],
  },
}));

export default ReceiptPreviewModal;
