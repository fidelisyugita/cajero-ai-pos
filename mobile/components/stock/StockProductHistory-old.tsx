import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTransactionsQuery } from "@/services/queries/useTransactionsQuery";
import { AnimatedFlashList as ShopifyAnimatedFlashList, type FlashListProps } from "@shopify/flash-list";
import React, { useMemo } from "react";
import dayjs from "dayjs";
import type { Product } from "@/services/types/Product";
import type { TransactionResponse } from "@/services/types/Transaction";
import { t } from "@/services/i18n";
import EmptyState from "@/components/ui/EmptyState";

// Workaround for missing estimatedItemSize in FlashList props type definition
const AnimatedFlashList = ShopifyAnimatedFlashList as unknown as <T>(
  props: FlashListProps<T> & { estimatedItemSize: number }
) => React.ReactElement;

interface StockProductHistoryProps {
  product: Product | null;
  onClose: () => void;
}

const StockProductHistory = ({ product, onClose }: StockProductHistoryProps) => {
  const startDate = useMemo(() => dayjs().subtract(7, 'day').format('YYYY-MM-DD'), []);
  const endDate = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useTransactionsQuery({
    productId: product?.id,
    size: 50, // Fetch enough to show
    startDate,
    endDate,
    sortBy: 'createdAt',
    sortDir: 'desc'
  });

  const transactions = data?.pages.flatMap(page => page.content) || [];

  const historyItems = useMemo(() => {
    if (!product) return [];
    return transactions.map(txn => {
      const productItem = txn.transactionProduct?.find(p => p.productId === product.id);
      if (!productItem) return null;

      return {
        id: txn.id,
        date: txn.createdAt,
        type: txn.transactionTypeCode || 'SALE', // Default to Sale if not specified? Or check logic
        quantity: productItem.quantity,
        totalPrice: productItem.sellingPrice * productItem.quantity // Approximation
      };
    }).filter(Boolean) as { id: string, date: string, type: string, quantity: number, totalPrice: number }[];
  }, [transactions, product]);

  if (!product) return null;

  return (
    <Modal visible={!!product} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={$.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={$.modalContent}>
            <View style={$.header}>
              <Text style={$.title}>Product History: {product.name}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={$.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>
            <Text style={$.subtitle}>Last 7 Days ({dayjs(startDate).format("DD MMM")} - {dayjs(endDate).format("DD MMM")})</Text>

            {historyItems.length > 0 && (
              <View style={$.headerRow}>
                <Text style={$.headerCell}>Date</Text>
                <Text style={$.headerCell}>Type</Text>
                <Text style={[$.headerCell, { textAlign: 'right' }]}>Qty</Text>
              </View>
            )}

            <AnimatedFlashList
              data={historyItems}
              estimatedItemSize={50}
              keyExtractor={(item) => item.id}
              onEndReached={() => {
                if (hasNextPage) fetchNextPage();
              }}
              onEndReachedThreshold={0.5}
              renderItem={({ item }) => (
                <View style={$.row}>
                  <Text style={$.cell}>{dayjs(item.date).format("DD/MM/YY HH:mm")}</Text>
                  <Text style={$.cell}>{item.type}</Text>
                  <Text style={[$.cell, { textAlign: 'right' }]}>{item.quantity}</Text>
                </View>
              )}
              contentContainerStyle={historyItems.length === 0 ? { flex: 1 } : undefined}
              ListEmptyComponent={
                <EmptyState
                  title={t("empty_product_history_week_title")}
                  subtitle={t("empty_product_history_week_subtitle")}
                />
              }
              ListFooterComponent={isFetchingNextPage ? <Text style={{ textAlign: 'center', padding: 10 }}>Loading more...</Text> : null}
            />
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const $ = StyleSheet.create((theme) => ({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.transparentModal,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.md,
    width: "100%",
    height: "80%",
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.heading4,
    flex: 1,
  },
  subtitle: {
    ...theme.typography.bodySm,
    color: theme.colors.neutral[500],
    marginBottom: theme.spacing.lg,
  },
  closeButton: {
    color: theme.colors.primary[500],
    ...theme.typography.labelMd,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
    paddingBottom: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  headerCell: {
    flex: 1,
    ...theme.typography.labelSm,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  cell: {
    flex: 1,
    ...theme.typography.bodyMd,
  },
  emptyText: {
    textAlign: "center",
    marginTop: theme.spacing.xl,
    color: theme.colors.neutral[500],
  }
}));

export default StockProductHistory;
