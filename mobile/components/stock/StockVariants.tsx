import { FlashList as ShopifyFlashList, type FlashListProps } from "@shopify/flash-list";
import React, { useState } from "react";

// Workaround for missing estimatedItemSize in FlashList props type definition
const FlashList = ShopifyFlashList as unknown as <T>(
  props: FlashListProps<T> & { estimatedItemSize: number }
) => React.ReactElement;

import { View, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcEdit from "@/assets/icons/edit.svg";
import IconButton from "@/components/ui/IconButton";
import { useVariantsQuery } from "@/services/queries/useVariantsQuery";
import { useProductsQuery } from "@/services/queries/useProductsQuery";
import type { Variant, VariantOption } from "@/services/types/Variant";
import Button from "@/components/ui/Button";
import { t } from "@/services/i18n";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import StockUpdateModal from "./StockUpdateModal";
import { useUpdateVariantStockMutation } from "@/services/mutations/useUpdateVariantStockMutation";
import StockVariantHistory from "./StockVariantHistory";

const COLUMNS = [
  { label: "Product Name", flex: 2 },
  { label: "Variant Name", flex: 2 },
  { label: "Stock", flex: 1 },
  { label: "Status", flex: 1 },
  { label: "Action", flex: 1 },
];

interface StockVariantsProps {
  searchQuery?: string;
}

interface FlattenedVariant {
  id: string; // option id
  variantId: string; // parent variant id
  name: string; // Combined name
  productName: string; // From mapped products
  stock: number;
  option: VariantOption;
  variant: Variant;
}

const StockVariants = ({ searchQuery = "" }: StockVariantsProps) => {
  const { data: variants, isLoading: isVariantsLoading } = useVariantsQuery();
  // Fetch all products to map names. Using a large page size to ensure coverage (similar to StockProducts)
  const { data: productsData, isLoading: isProductsLoading } = useProductsQuery({
    page: 0,
    size: 1000,
    sortBy: 'name',
    sortDir: 'asc'
  });

  const isLoading = isVariantsLoading || isProductsLoading;

  const [selectedHistory, setSelectedHistory] = useState<{ variant: Variant, option: VariantOption } | null>(null);
  const [editingItem, setEditingItem] = useState<{ variant: Variant, option: VariantOption } | null>(null);
  const updateVariantStockMutation = useUpdateVariantStockMutation();

  const flattenedVariants: FlattenedVariant[] = React.useMemo(() => {
    if (!variants || !productsData) return [];

    const productMap = new Map(productsData.content.map(p => [p.id, p]));

    const flat: FlattenedVariant[] = [];
    variants.forEach(variant => {
      const product = productMap.get(variant.productId);
      const productName = product?.name || "Unknown Product";

      // Only include variants that match search query (checking variant name or option name or product name)
      const variantMatches = variant.name.toLowerCase().includes(searchQuery.toLowerCase());
      const productMatches = productName.toLowerCase().includes(searchQuery.toLowerCase());

      variant.options.forEach(option => {
        const optionMatches = option.name.toLowerCase().includes(searchQuery.toLowerCase());

        if (searchQuery === "" || variantMatches || optionMatches || productMatches) {
          flat.push({
            id: option.id,
            variantId: variant.id,
            name: `${variant.name} - ${option.name}`,
            productName: productName,
            stock: option.stock,
            option: option,
            variant: variant
          });
        }
      });
    });
    return flat.sort((a, b) => {
      const productCompare = a.productName.localeCompare(b.productName);
      if (productCompare !== 0) return productCompare;
      return a.name.localeCompare(b.name);
    });
  }, [variants, productsData, searchQuery]);


  const handleUpdateStock = (newStock: number) => {
    if (!editingItem) return;

    updateVariantStockMutation.mutate(
      {
        id: editingItem.option.id,
        stock: newStock,
        reason: "Manual correction via App",
      },
      {
        onSuccess: () => {
          setEditingItem(null);
        },
      }
    );
  };

  const renderSkeleton = () => (
    <View style={$.container}>
      <View style={$.header}>
        {COLUMNS.map((col) => (
          <Skeleton
            key={col.label}
            style={{ flex: col.flex, marginRight: 10 }}
            height={20}
          />
        ))}
      </View>
      <View style={$.listContent}>
        {[...Array(10)].map((_, index) => (
          <View key={index} style={$.row}>
            {COLUMNS.map((col, cIndex) => (
              <Skeleton
                key={cIndex}
                style={{ flex: col.flex, marginRight: 10 }}
                height={20}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );

  if (isLoading) {
    return renderSkeleton();
  }

  return (
    <View style={$.container}>
      {flattenedVariants.length > 0 && (
        <View style={$.header}>
          {COLUMNS.map((col) => (
            <Text key={col.label} style={[$.headerText, { flex: col.flex }]}>
              {col.label}
            </Text>
          ))}
        </View>
      )}
      <FlashList<FlattenedVariant>
        contentContainerStyle={[$.listContent, flattenedVariants.length === 0 && { flex: 1 }]}
        data={flattenedVariants}
        estimatedItemSize={60}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VariantRow
            item={item}
            onHistoryPress={() => setSelectedHistory({ variant: item.variant, option: item.option })}
            onStockUpdatePress={() => setEditingItem({ variant: item.variant, option: item.option })}
          />
        )}
        ItemSeparatorComponent={() => <View style={$.separator} />}
        ListEmptyComponent={
          <EmptyState
            title={t("empty_variants_title") || "No Variants Found"}
            subtitle={t("empty_variants_subtitle") || "Try adjusting your search or add variants."}
          />
        }
      />
      {selectedHistory && (
        <StockVariantHistory
          variant={selectedHistory.variant}
          option={selectedHistory.option}
          onClose={() => setSelectedHistory(null)}
        />
      )}
      {editingItem && (
        <StockUpdateModal
          visible={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdateStock}
          currentStock={editingItem.option.stock}
          itemName={flattenedVariants.find(f => f.id === editingItem.option.id)?.name || ""}
          isLoading={updateVariantStockMutation.isPending}
        />
      )}
    </View>
  );
};

const VariantRow = ({ item, onHistoryPress, onStockUpdatePress }: { item: FlattenedVariant; onHistoryPress: () => void; onStockUpdatePress: () => void }) => {
  let status = "In Stock";
  let statusVariant: "active" | "inactive" | "warning" = "active";

  if (item.stock <= 0) {
    status = "Out of Stock";
    statusVariant = "inactive";
  } else if (item.stock < 10) { // Arbitrary low stock threshold for variants
    status = "Low Stock";
    statusVariant = "warning";
  }

  return (
    <View style={$.row}>
      <Text style={[$.cellText, { flex: COLUMNS[0].flex }]} numberOfLines={1}>{item.productName}</Text>
      <Text style={[$.cellText, { flex: COLUMNS[1].flex }]} numberOfLines={1}>{item.name}</Text>
      <View style={{ flex: COLUMNS[2].flex, flexDirection: 'row', gap: 4, alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold', ...$.cellText, paddingRight: 0 }}>{item.stock}</Text>
        <IconButton
          Icon={IcEdit}
          onPress={onStockUpdatePress}
          size="sm"
          variant="neutral-no-stroke"
        />
      </View>
      <View style={{ flex: COLUMNS[3].flex }}>
        <StatusBadge variant={statusVariant} label={status} />
      </View>
      <View style={[$.actionContainer, { flex: COLUMNS[4].flex }]}>
        <Button
          size="sm"
          title="History"
          variant="neutral"
          onPress={onHistoryPress}
        />
      </View>
    </View>
  );
};

const StatusBadge = ({ variant, label }: { variant: "active" | "inactive" | "warning", label: string }) => {
  $.useVariants({ status: variant });
  return (
    <View style={$.badge}>
      <Text style={$.badgeText}>{label}</Text>
    </View>
  );
}

const $ = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.sup.red,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[300],
  },
  headerText: {
    ...theme.typography.labelMd,
    color: theme.colors.neutral[700],
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.neutral[200],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  cellText: {
    ...theme.typography.bodyMd,
    color: theme.colors.neutral[700],
    paddingRight: theme.spacing.sm,
  },
  badge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    alignSelf: "flex-start",
    variants: {
      status: {
        active: {
          backgroundColor: theme.colors.positive[100],
          borderColor: theme.colors.positive[300],
        },
        inactive: {
          backgroundColor: theme.colors.error[100],
          borderColor: theme.colors.error[300],
        },
        warning: {
          backgroundColor: theme.colors.warning[100],
          borderColor: theme.colors.warning[300],
        },
      },
    },
  },
  badgeText: {
    ...theme.typography.labelSm,
    variants: {
      status: {
        active: {
          color: theme.colors.positive[500],
        },
        inactive: {
          color: theme.colors.error[500],
        },
        warning: {
          color: theme.colors.warning[500],
        },
      },
    },
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  }
}));

export default StockVariants;
