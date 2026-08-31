import {
  type FlashListProps,
  AnimatedFlashList as ShopifyAnimatedFlashList,
} from "@shopify/flash-list";
import type React from "react";
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { t } from "@/services/i18n";
import { useStockMovementsQuery } from "@/services/queries/useStockMovementsQuery";
import type { Product } from "@/services/types/Product";
import type { StockMovement } from "@/services/types/StockMovement";
import { formatCustomDate } from "@/utils/Date";

// Workaround for missing estimatedItemSize in FlashList props type definition
const AnimatedFlashList = ShopifyAnimatedFlashList as unknown as <T>(
  props: FlashListProps<T> & { estimatedItemSize: number },
) => React.ReactElement;

interface StockProductHistoryProps {
  product: Product | null;
  onClose: () => void;
}

const StockProductHistory = ({ product, onClose }: StockProductHistoryProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useStockMovementsQuery({
    productId: product?.id,
    size: 20,
    sort: "createdAt,desc",
  });

  const movements = data?.pages.flatMap((page) => page.content) || [];

  if (!product) return null;

  return (
    <Modal visible={!!product} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={$.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={$.modalContent}>
            <View style={$.header}>
              <Text style={$.title}>
                {t("stock_history")}: {product.name}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={$.closeButton}>{t("close")}</Text>
              </TouchableOpacity>
            </View>

            <View style={$.headerRow}>
              <Text style={$.headerCell}>{t("date")}</Text>
              <Text style={$.headerCell}>{t("type")}</Text>
              <Text style={$.headerCell}>{t("qty")}</Text>
              <Text style={$.headerCell}>{t("by")}</Text>
              <Text style={[$.headerCell, { flex: 2 }]}>{t("info")}</Text>
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
                  <Text style={$.cell}>{formatCustomDate(item.createdAt, "DD/MM/YY HH:mm")}</Text>
                  <Text style={[$.cell, { color: item.type === "IN" ? "green" : "red" }]}>
                    {item.type}
                  </Text>
                  <Text style={$.cell}>{item.quantity}</Text>
                  <Text style={$.cell}>{item.createdByName || "-"}</Text>
                  <Text style={[$.cell, { flex: 2 }]} numberOfLines={2}>
                    {item.transactionDescription || "-"}
                  </Text>
                </View>
              )}
              ListEmptyComponent={<Text style={$.emptyText}>{t("no_history_found")}</Text>}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <Text style={{ textAlign: "center", padding: 10 }}>{t("loading_more")}</Text>
                ) : null
              }
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
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.heading4,
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
  },
}));

export default StockProductHistory;
