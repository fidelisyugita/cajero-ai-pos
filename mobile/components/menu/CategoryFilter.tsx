import { FlashList } from "@shopify/flash-list";
import { type ComponentProps, memo, useCallback, useMemo } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import IcX from "@/assets/icons/x.svg";
import Button from "@/components/ui/Button";
import { t } from "@/services/i18n";
import { useDeleteCategoryMutation } from "@/services/mutations/useDeleteCategoryMutation";
import { useProductCategoriesQuery } from "@/services/queries/useProductCategoriesQuery";
import type { ProductCategory } from "@/services/types/ProductCategory";
import { useCategoryStore } from "@/store/useMenuCategoryStore";
import { vs } from "@/utils/Scale";

interface CategoryFilterProps {
  style?: ComponentProps<typeof Animated.View>["style"];
  editable?: boolean;
}

const categoryKeyExtractor = (item: ProductCategory) => item.code;

const CategoryFilter = ({ style, editable }: CategoryFilterProps) => {
  const { data } = useProductCategoriesQuery();
  const searchQuery = useCategoryStore((s) => s.searchQuery);

  const dataWithAll = useMemo(() => {
    // Fixed "All" category
    const allCategory: ProductCategory = {
      code: "ALL",
      name: t("all"),
      description: "",
      storeId: "",
      createdBy: "",
      updatedBy: "",
      createdAt: "",
      updatedAt: "",
      deletedAt: null,
    };
    return [allCategory, ...(data || [])];
  }, [data]);

  const renderItem = useCallback(
    ({ item }: { item: ProductCategory }) => <CategoryItem editable={editable} item={item} />,
    [editable],
  );

  if (searchQuery.length >= 2) return null;

  return (
    <Animated.View style={[$.container, style]}>
      <FlashList
        contentContainerStyle={$.content}
        data={dataWithAll}
        horizontal
        ItemSeparatorComponent={CategorySeparator}
        keyExtractor={categoryKeyExtractor}
        renderItem={renderItem}
      />
    </Animated.View>
  );
};

const CategorySeparator = () => <View style={$.separator} />;

interface CategoryItemProps {
  item: ProductCategory;
  editable?: boolean;
}

const CategoryItem = memo(({ item, editable }: CategoryItemProps) => {
  const { theme } = useUnistyles();
  const { mutate: deleteCategory } = useDeleteCategoryMutation();
  const active = useCategoryStore((state) => state.selectedCategory === item.code);
  const setSelectedCategory = useCategoryStore((state) => state.setSelectedCategory);

  const handleSelect = useCallback(() => {
    setSelectedCategory(item.code);
  }, [setSelectedCategory, item.code]);

  const handleDelete = useCallback(() => {
    Alert.alert("Delete Category", `Are you sure you want to delete ${item.name}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteCategory(item.code),
      },
    ]);
  }, [deleteCategory, item.code, item.name]);

  return (
    <Button
      onPress={handleSelect}
      size="md"
      title={item.name}
      variant={active ? "soft" : "neutral"}
      right={
        editable &&
        item.code !== "ALL" && (
          <TouchableOpacity onPress={handleDelete} style={$.deleteButton}>
            <IcX color={theme.colors.neutral[500]} height={vs(20)} width={vs(20)} />
          </TouchableOpacity>
        )
      }
    />
  );
});

CategoryItem.displayName = "CategoryItem";

const $ = StyleSheet.create((theme) => ({
  container: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  content: {
    paddingTop: theme.spacing.xs,
  },
  separator: {
    marginRight: theme.spacing.md,
  },
  deleteButton: {
    marginLeft: theme.spacing.md,
  },
}));

export default memo(CategoryFilter);
