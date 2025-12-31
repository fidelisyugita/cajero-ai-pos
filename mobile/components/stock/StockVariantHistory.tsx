import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useStockMovementsQuery } from "@/services/queries/useStockMovementsQuery";
import { AnimatedFlashList as ShopifyAnimatedFlashList, type FlashListProps } from "@shopify/flash-list";
import React from "react";

// Workaround for missing estimatedItemSize in FlashList props type definition
const AnimatedFlashList = ShopifyAnimatedFlashList as unknown as <T>(
  props: FlashListProps<T> & { estimatedItemSize: number }
) => React.ReactElement;
import dayjs from "dayjs";
import type { Variant, VariantOption } from "@/services/types/Variant";
import type { StockMovement } from "@/services/types/StockMovement";

import { useProductQuery } from "@/services/queries/useProductQuery";

interface StockVariantHistoryProps {
  variant: Variant;
  option: VariantOption;
  onClose: () => void;
}

const StockVariantHistory = ({ variant, option, onClose }: StockVariantHistoryProps) => {
  const { data: product } = useProductQuery(variant.productId);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useStockMovementsQuery({
    variantId: option.id,
    size: 20,
    sort: 'createdAt,desc'
  });

  const movements = data?.pages.flatMap((page: any) => page.content) || [];

  return (
    <Modal visible={true} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={$.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={$.modalContent}>
            <View style={$.header}>
              <Text style={$.title}>
                Stock History: {product?.name ? `${product.name} - ` : ""}{variant.name} - {option.name}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={$.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={$.headerRow}>
              <Text style={$.headerCell}>Date</Text>
              <Text style={[$.headerCell, { flex: 1.5 }]}>Product</Text>
              <Text style={$.headerCell}>Type</Text>
              <Text style={$.headerCell}>Qty</Text>
              <Text style={$.headerCell}>By</Text>
              <Text style={[$.headerCell, { flex: 2 }]}>Info</Text>
            </View>

            <AnimatedFlashList
              data={movements}
              estimatedItemSize={50}
              keyExtractor={(item: StockMovement) => item.id}
              onEndReached={() => {
                if (hasNextPage) fetchNextPage();
              }}
              onEndReachedThreshold={0.5}
              renderItem={({ item }: { item: StockMovement }) => (
                <View style={$.row}>
                  <Text style={$.cell}>{dayjs(item.createdAt).format("DD/MM/YY HH:mm")}</Text>
                  <Text style={[$.cell, { flex: 1.5 }]}>{product?.name || '-'}</Text>
                  <Text style={[$.cell, { color: item.type === 'IN' ? 'green' : (['OUT', 'SOLD', 'WASTE', 'EXPIRED'].includes(item.type) ? 'red' : 'black') }]}>{item.type}</Text>
                  <Text style={$.cell}>{item.quantity}</Text>
                  <Text style={$.cell}>{item.createdByName || '-'}</Text>
                  <Text style={[$.cell, { flex: 2 }]} numberOfLines={2}>{item.transactionDescription || '-'}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={$.emptyText}>No history found.</Text>}
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Using direct rgba since transparentModal might not be available or consistent
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
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.heading4,
    flex: 1, // Allow text to wrap if needed
    marginRight: theme.spacing.md,
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

export default StockVariantHistory;
