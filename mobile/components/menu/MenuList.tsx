import { AnimatedFlashList, type FlashListProps } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { type ComponentRef, memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcEdit from "@/assets/icons/edit.svg";
import IcPlus from "@/assets/icons/plus.svg";
import EmptyState from "@/components/ui/EmptyState";
import IconButton from "@/components/ui/IconButton";
import { t } from "@/services/i18n";
import { useProductsQuery } from "@/services/queries/useProductsQuery";
import type { Product } from "@/services/types/Product";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoryStore } from "@/store/useMenuCategoryStore";
import { useSyncStore } from "@/store/useSyncStore";
import { formatCurrency } from "@/utils/Format";
import { vs } from "@/utils/Scale";
import MenuListSkeleton from "./MenuListSkeleton";

type AnimatedListRef = ComponentRef<typeof AnimatedFlashList>;

interface MenuListProps {
  scrollHandler?: FlashListProps<Product>["onScroll"];
  editable?: boolean;
}

interface ProductCardProps {
  item: Product;
  editable?: boolean;
  onSelect: (item: Product) => void;
}

const NUM_COLUMNS = 4;
const EMPTY_PRODUCTS: Product[] = [];
const productKeyExtractor = (item: Product) => item.id.toString();

const MenuList = ({ scrollHandler, editable }: MenuListProps) => {
  const router = useRouter();
  const selectedCategory = useCategoryStore((s) => s.selectedCategory);
  const searchKeyword = useCategoryStore((s) => (s.searchQuery.length >= 2 ? s.searchQuery : ""));
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const listRef = useRef<AnimatedListRef | null>(null);

  const isSearching = searchKeyword.length >= 2;
  const categoryCode = isSearching || selectedCategory === "ALL" ? undefined : selectedCategory;

  const queryParams = useMemo(
    () => ({
      page: 0,
      size: 16,
      sortBy: "name",
      sortDir: "asc",
      categoryCode,
      keyword: isSearching ? searchKeyword : undefined,
      includeDeleted: editable,
    }),
    [categoryCode, isSearching, searchKeyword, editable],
  );

  const { data, isLoading } = useProductsQuery(queryParams);

  useEffect(() => {
    if (listRef.current && "scrollToOffset" in listRef.current) {
      (
        listRef.current as {
          scrollToOffset: (params: { offset: number; animated?: boolean }) => void;
        }
      ).scrollToOffset({ offset: 0, animated: false });
    }
  }, []);

  const showLoader = isLoading || (isSyncing && (!data?.content || data.content.length === 0));

  // Authorization check
  const canEditMenu = useAuthStore(
    (state) => state.user?.roleCode === "OWNER" || state.user?.roleCode === "MANAGER",
  );

  const handleSelectProduct = useCallback(
    (item: Product) => {
      if (editable) {
        router.push({
          pathname: "/product/add",
          params: { id: item.id },
        });
        return;
      }
      if (item.deletedAt) return;

      router.push({
        pathname: "/modal/order/add-item",
        params: {
          id: item.id,
          name: item.name,
          sellingPrice: item.sellingPrice,
          imageUrl: item.imageUrl,
          tax: item.tax,
          commission: item.commission,
        },
      });
    },
    [editable, router],
  );

  const renderProductCard = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard editable={editable} item={item} onSelect={handleSelectProduct} />
    ),
    [editable, handleSelectProduct],
  );

  const emptyComponent = useMemo(
    () => (
      <EmptyState
        title={isSearching ? t("empty_menu_search_title") : t("empty_menu_category_title")}
        subtitle={isSearching ? t("empty_menu_search_subtitle") : t("empty_menu_category_subtitle")}
        style={$.emptyState}
      />
    ),
    [isSearching],
  );

  if (showLoader) {
    return <MenuListSkeleton />;
  }

  return (
    <>
      <AnimatedFlashList
        ref={listRef}
        contentContainerStyle={$.content}
        data={data?.content ?? EMPTY_PRODUCTS}
        keyExtractor={productKeyExtractor}
        numColumns={NUM_COLUMNS}
        onScroll={scrollHandler}
        renderItem={renderProductCard}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={$.container}
        ListEmptyComponent={emptyComponent}
      />
      {!editable && canEditMenu && <MenuActions />}
    </>
  );
};

const MenuActions = memo(() => {
  const router = useRouter();

  const handleEditList = useCallback(() => {
    router.push("/product/edit-list");
  }, [router]);

  const handleAddProduct = useCallback(() => {
    router.push("/product/add");
  }, [router]);

  return (
    <View style={$.actionsContainer}>
      <IconButton Icon={IcEdit} onPress={handleEditList} size="lg" variant="secondary" />
      <IconButton Icon={IcPlus} onPress={handleAddProduct} size="lg" variant="primary" />
    </View>
  );
});

MenuActions.displayName = "MenuActions";

const ProductCard = memo(({ item, editable, onSelect }: ProductCardProps) => {
  const isDeleted = !!item.deletedAt;

  const handlePress = useCallback(() => {
    onSelect(item);
  }, [onSelect, item]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={isDeleted ? $.productContainerDeleted : $.productContainer}
    >
      <View>
        <Image
          cachePolicy="memory-disk"
          contentFit="cover"
          recyclingKey={item.imageUrl || item.id}
          source={item.imageUrl}
          style={isDeleted ? $.productImageDeleted : $.productImage}
        />
        {editable && (
          <View style={$.editIconOverlay}>
            <IcEdit color="white" height={vs(16)} width={vs(16)} />
          </View>
        )}
        {isDeleted && (
          <View style={$.deletedOverlay}>
            <Text style={$.deletedText}>{t("hidden")}</Text>
          </View>
        )}
      </View>
      <View style={$.productInfoWrapper}>
        <Text style={isDeleted ? $.productNameDeleted : $.productName}>{item.name}</Text>
        <Text style={isDeleted ? $.productPriceDeleted : $.productPrice}>
          {formatCurrency(item.sellingPrice)}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

ProductCard.displayName = "ProductCard";

const $ = StyleSheet.create((theme, rt) => {
  const productContainerBase = {
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.md,
    borderWidth: vs(1),
    borderColor: theme.colors.neutral[300],
    padding: theme.spacing.md,
    flexGrow: 1,
    marginRight: vs(20),
    marginBottom: vs(20),
  };

  const productImageBase = {
    aspectRatio: 177 / 96,
    borderRadius: theme.radius.sm,
  };

  const productNameBase = {
    ...theme.typography.heading5,
    color: theme.colors.neutral[700],
  };

  const productPriceBase = {
    ...theme.typography.labelMd,
    color: theme.colors.primary[400],
  };

  return {
    container: {
      marginLeft: theme.spacing.xl,
      marginRight: theme.spacing.xs,
      gap: theme.spacing.xxl,
      flex: 1,
    },
    content: {
      paddingTop: vs(80),
    },
    productContainer: productContainerBase,
    productContainerDeleted: {
      ...productContainerBase,
      borderColor: theme.colors.neutral[200],
    },
    productImage: productImageBase,
    productImageDeleted: {
      ...productImageBase,
      opacity: 0.5,
    },
    editIconOverlay: {
      position: "absolute",
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      backgroundColor: theme.colors.primary[400],
      padding: theme.spacing.xs,
      borderRadius: theme.radius.xs,
      zIndex: 20,
    },
    productInfoWrapper: {
      gap: theme.spacing.xs,
    },
    productName: productNameBase,
    productNameDeleted: {
      ...productNameBase,
      color: theme.colors.neutral[400],
    },
    productPrice: productPriceBase,
    productPriceDeleted: {
      ...productPriceBase,
      color: theme.colors.neutral[400],
    },
    actionsContainer: {
      flexDirection: "row",
      gap: vs(20),
      position: "absolute",
      bottom: rt.insets.bottom || theme.spacing.xl,
      right: theme.spacing.xl,
      zIndex: 10,
    },
    deletedOverlay: {
      position: "absolute",
      top: theme.spacing.xs,
      left: theme.spacing.xs,
      backgroundColor: theme.colors.neutral[600],
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.radius.xs,
      zIndex: 20,
    },
    deletedText: {
      ...theme.typography.labelSm,
      color: "white",
    },
    emptyState: {
      marginTop: vs(100),
    },
  };
});

export default memo(MenuList);
