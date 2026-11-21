import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcMinus from "@/assets/icons/minus.svg";
import IcPlus from "@/assets/icons/plus.svg";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import RadioButton from "@/components/ui/RadioButton";
import ScreenModal from "@/components/ui/ScreenModal";
import { t } from "@/services/i18n";
import Logger from "@/services/logger";
import { useVariantsQuery } from "@/services/queries/useVariantsQuery";
import type { Variant, VariantOption } from "@/services/types/Variant";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useOrderStore } from "@/store/useOrderStore";
import { formatCurrency } from "@/utils/Format";
import { vs } from "@/utils/Scale";

type VariantItemSelection = { groupId: string; optionId: string };

interface ProductSummary {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  tax: number;
  commission: number;
}

const ProductHeader = memo(({ product }: { product: ProductSummary }) => (
  <View style={$.productHeader}>
    <Image source={product.imageUrl} style={$.productImage} contentFit="cover" />
    <View style={$.productInfo}>
      <Text style={$.productName}>{product.name}</Text>
      <View style={$.priceRow}>
        <Text style={$.priceLabel}>{t("basic_price")}</Text>
        <Text style={$.priceValue}>{formatCurrency(product.price)}</Text>
      </View>
    </View>
  </View>
));

interface VariantOptionRowProps {
  variantId: string;
  isMultiple: boolean;
  option: VariantOption;
  isSelected: boolean;
  onToggle: (variantId: string, optionId: string, isMultiple: boolean) => void;
}

const VariantOptionRow = memo(
  ({ variantId, isMultiple, option, isSelected, onToggle }: VariantOptionRowProps) => {
    const handlePress = useCallback(() => {
      onToggle(variantId, option.id, isMultiple);
    }, [onToggle, variantId, option.id, isMultiple]);

    return (
      <TouchableOpacity style={$.optionRow} activeOpacity={0.7} onPress={handlePress}>
        <View style={$.optionLeft}>
          {!isMultiple ? (
            <RadioButton checked={isSelected} />
          ) : (
            <Checkbox checked={isSelected} onPress={handlePress} />
          )}
          <Text style={$.optionName}>{option.name}</Text>
        </View>
        <Text style={$.optionPrice}>
          {option.priceAdjusment === 0 ? "Rp 0" : formatCurrency(option.priceAdjusment)}
        </Text>
      </TouchableOpacity>
    );
  },
);

interface VariantGroupProps {
  variant: Variant;
  selection: string | string[] | undefined;
  onToggle: (variantId: string, optionId: string, isMultiple: boolean) => void;
}

const VariantGroup = memo(({ variant, selection, onToggle }: VariantGroupProps) => (
  <View style={$.variantGroup}>
    <Text style={$.variantGroupTitle}>
      {variant.name}
      {variant.isRequired && " *"}
    </Text>
    <View style={$.optionsList}>
      {variant.options.map((option) => {
        const isSelected = !variant.isMultiple
          ? selection === option.id
          : Array.isArray(selection) && selection.includes(option.id);

        return (
          <VariantOptionRow
            key={option.id}
            variantId={variant.id}
            isMultiple={variant.isMultiple}
            option={option}
            isSelected={isSelected}
            onToggle={onToggle}
          />
        );
      })}
    </View>
  </View>
));

function resolveSelectedVariants(
  productVariants: Variant[],
  selectedVariants: Record<string, string | string[]>,
) {
  const result: Array<{
    groupId: string;
    groupName: string;
    optionId: string;
    name: string;
    price: number;
  }> = [];

  for (const variant of productVariants) {
    const selection = selectedVariants[variant.id];
    if (!selection) continue;

    const optionIds = Array.isArray(selection) ? selection : [selection];
    for (const optId of optionIds) {
      const opt = variant.options.find((o) => o.id === optId);
      if (opt) {
        result.push({
          groupId: variant.id,
          groupName: variant.name,
          optionId: opt.id,
          name: opt.name,
          price: opt.priceAdjusment, // backend typo: priceAdjusment
        });
      }
    }
  }

  return result;
}

function parseInitialVariantSelection(
  rawVariants: unknown,
  productVariants: Array<{ id: string; isMultiple: boolean }>,
): Record<string, string | string[]> | null {
  if (typeof rawVariants !== "string" || !rawVariants) {
    return null;
  }
  try {
    const initialItems = JSON.parse(rawVariants);
    if (!Array.isArray(initialItems)) {
      return null;
    }

    const newSelection: Record<string, string | string[]> = {};
    for (const v of productVariants) {
      const selectedForGroup = initialItems.filter((i: VariantItemSelection) => i.groupId === v.id);

      if (selectedForGroup.length > 0) {
        newSelection[v.id] = v.isMultiple
          ? selectedForGroup.map((i: VariantItemSelection) => i.optionId)
          : selectedForGroup[0].optionId;
      }
    }
    return newSelection;
  } catch (e) {
    Logger.error("Failed to parse initial variants", e);
    return null;
  }
}

const AddItemModal = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderItemId = params.orderItemId as string | undefined;

  const product = useMemo<ProductSummary>(
    () => ({
      id: params.id as string,
      name: params.name as string,
      price: Number(params.sellingPrice),
      imageUrl: params.imageUrl as string,
      tax: Number(params.tax) || 0,
      commission: Number(params.commission) || 0,
    }),
    [params.id, params.name, params.sellingPrice, params.imageUrl, params.tax, params.commission],
  );

  const { data: allVariants, isLoading } = useVariantsQuery();

  const productVariants = useMemo(() => {
    if (!allVariants) return [];
    return allVariants.filter((v) => v.productId === product.id);
  }, [allVariants, product.id]);

  const [quantity, setQuantity] = useState(
    params.initialQuantity ? Number(params.initialQuantity) : 1,
  );

  const business = useBusinessStore((state) => state.business);
  const maxDiscountPercent = business?.maxDiscount ?? 10;

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string | string[]>>({});
  const variantsInitialized = useRef(false);

  useEffect(() => {
    if (productVariants.length === 0 || !params.initialVariants || variantsInitialized.current) {
      return;
    }
    const initialSelection = parseInitialVariantSelection(params.initialVariants, productVariants);
    if (initialSelection) {
      setSelectedVariants(initialSelection);
    }
    variantsInitialized.current = true;
  }, [productVariants, params.initialVariants]);
  const [note, setNote] = useState((params.initialNote as string) || "");
  const [discount, setDiscount] = useState(
    params.initialDiscount ? String(params.initialDiscount) : "",
  );

  const handleDecrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const handleIncrementQuantity = useCallback(() => {
    setQuantity((prev) => prev + 1);
  }, []);

  const handleVariantChange = useCallback(
    (variantId: string, optionId: string, isMultiple: boolean) => {
      if (!isMultiple) {
        // Radio logic: single selection per variant group
        setSelectedVariants((prev) => {
          if (prev[variantId] === optionId) {
            return prev;
          }
          return { ...prev, [variantId]: optionId };
        });
      } else {
        // Checkbox logic: multiple selection
        setSelectedVariants((prev) => {
          const val = prev[variantId];
          const current = Array.isArray(val) ? val : [];
          if (current.includes(optionId)) {
            return {
              ...prev,
              [variantId]: current.filter((id: string) => id !== optionId),
            };
          }
          // Note: Max limit logic removed as it's not supported by backend yet
          return { ...prev, [variantId]: [...current, optionId] };
        });
      }
    },
    [],
  );

  const selectedVariantItems = useMemo(
    () => resolveSelectedVariants(productVariants, selectedVariants),
    [productVariants, selectedVariants],
  );

  const totalVariantPrice = useMemo(
    () => selectedVariantItems.reduce((sum, v) => sum + v.price, 0),
    [selectedVariantItems],
  );

  const handleDiscountChange = useCallback(
    (text: string) => {
      const maxPrice = (product.price + totalVariantPrice) * quantity;
      const maxAllowedDiscount = maxPrice * (maxDiscountPercent / 100);

      const numericValue = Number(text);
      if (text === "" || (numericValue >= 0 && numericValue <= maxAllowedDiscount)) {
        setDiscount(text);
      }
    },
    [product.price, totalVariantPrice, quantity, maxDiscountPercent],
  );

  const addItem = useOrderStore((state) => state.addItem);
  const updateItem = useOrderStore((state) => state.updateItem);

  const handleAdd = useCallback(() => {
    const unitPrice = product.price + totalVariantPrice;
    const totalPrice = unitPrice * quantity;
    const discountAmount = Number(discount) || 0;
    const maxAmount = totalPrice * (maxDiscountPercent / 100);

    if (discountAmount > maxAmount) {
      Alert.alert(t("error"), t("discount_exceeds_price"));
      return;
    }

    const orderItemData = {
      productId: product.id,
      name: product.name,
      sellingPrice: product.price,
      imageUrl: product.imageUrl,
      quantity: quantity,
      variants: selectedVariantItems,
      note: note,
      discount: Number(discount) || 0,
      tax: product.tax,
      commission: product.commission,
    };

    if (orderItemId) {
      updateItem({ ...orderItemData, id: orderItemId });
    } else {
      addItem(orderItemData);
    }

    router.dismiss();
  }, [
    selectedVariantItems,
    product,
    totalVariantPrice,
    quantity,
    discount,
    maxDiscountPercent,
    note,
    orderItemId,
    updateItem,
    addItem,
    router,
  ]);

  return (
    <ScreenModal modalStyle={$.modal}>
      <ScreenModal.Header title={orderItemId ? t("edit_item") : t("add_item")} />
      <ScreenModal.Body>
        <View style={$.container}>
          <ScrollView contentContainerStyle={$.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Product Header */}
            <ProductHeader product={product} />

            {/* Quantity */}
            <View style={$.quantityContainer}>
              <View style={$.quantityControls}>
                <IconButton
                  Icon={IcMinus}
                  variant="neutral"
                  size="md"
                  onPress={handleDecrementQuantity}
                  disabled={quantity <= 1}
                />
                <View style={$.quantityDisplay}>
                  <Text style={$.quantityText}>{quantity}</Text>
                </View>
                <IconButton
                  Icon={IcPlus}
                  variant="neutral"
                  size="md"
                  onPress={handleIncrementQuantity}
                />
              </View>
            </View>

            <Text style={$.sectionTitle}>{t("variant")}</Text>

            {isLoading ? (
              <ActivityIndicator size="large" color="#0000ff" style={$.loadingIndicator} />
            ) : (
              /* Variants List */
              productVariants.map((variant) => (
                <VariantGroup
                  key={variant.id}
                  variant={variant}
                  selection={selectedVariants[variant.id]}
                  onToggle={handleVariantChange}
                />
              ))
            )}

            {/* Note & Discount */}
            <View style={$.inputGroup}>
              <Input
                label="Note (Optional)"
                size="lg"
                value={note}
                onChangeText={setNote}
                placeholder="e.g. Sambal dipisah, less sugar"
              />
              <Input
                label="Discount"
                size="lg"
                value={discount}
                left={<Text style={$.currencyPrefix}>Rp</Text>}
                onChangeText={handleDiscountChange}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
        </View>
      </ScreenModal.Body>
      <ScreenModal.Footer>
        <Button
          title={orderItemId ? t("update_order") : t("add_to_order_list")}
          size="lg"
          variant="primary"
          style={$.addButton}
          onPress={handleAdd}
        />
      </ScreenModal.Footer>
    </ScreenModal>
  );
};

const $ = StyleSheet.create((theme) => ({
  modal: {
    width: vs(600),
    height: "90%",
    maxHeight: vs(900),
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[100],
  },
  scrollContent: {
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
    paddingBottom: vs(100),
  },
  productHeader: {
    flexDirection: "row",
    gap: theme.spacing.lg,
  },
  productImage: {
    width: vs(180),
    height: vs(120),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.neutral[200],
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  productName: {
    ...theme.typography.heading3,
    color: theme.colors.neutral[700],
  },
  priceRow: {
    gap: theme.spacing.xs,
  },
  priceLabel: {
    ...theme.typography.bodyMd,
    color: theme.colors.neutral[500],
  },
  priceValue: {
    ...theme.typography.heading4,
    color: theme.colors.primary[500],
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.lg,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  quantityDisplay: {
    width: vs(50),
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[400],
    paddingVertical: theme.spacing.xs,
  },
  quantityText: {
    ...theme.typography.heading5,
    color: theme.colors.neutral[700],
  },
  sectionTitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.neutral[500],
    marginTop: theme.spacing.md,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  variantGroup: {
    gap: theme.spacing.md,
  },
  variantGroupTitle: {
    ...theme.typography.heading5,
    color: theme.colors.neutral[700],
  },
  optionsList: {
    gap: theme.spacing.md,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  optionName: {
    ...theme.typography.bodyLg,
    color: theme.colors.neutral[700],
  },
  optionPrice: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary[500],
  },
  inputGroup: {
    gap: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  currencyPrefix: {
    ...theme.typography.bodyMd,
    color: theme.colors.neutral[500],
    paddingLeft: theme.spacing.xs,
  },
  addButton: {
    flex: 1,
  },
}));

export default AddItemModal;
