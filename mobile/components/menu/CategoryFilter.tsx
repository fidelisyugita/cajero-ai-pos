import { type ComponentProps, memo, useCallback, useMemo } from "react";
import { Alert, ScrollView, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import IcX from "@/assets/icons/x.svg";
import Button from "@/components/ui/Button";
import { t } from "@/services/i18n";
import { useDeleteCategoryMutation } from "@/services/mutations/useDeleteCategoryMutation";
import { useProductCategoriesQuery } from "@/services/queries/useProductCategoriesQuery";
import { useCategoryStore } from "@/store/useMenuCategoryStore";
import { vs } from "@/utils/Scale";

interface CategoryFilterProps {
  style?: ComponentProps<typeof Animated.View>["style"];
  editable?: boolean;
}

const CategoryFilter = ({ style, editable }: CategoryFilterProps) => {
  const { data } = useProductCategoriesQuery();
  const isHidden = useCategoryStore((s) => s.searchQuery.length >= 2);

  const containerStyle = useMemo(() => (style ? [$.container, style] : $.container), [style]);

  const categoryItems = useMemo(
    () =>
      data?.map((item) => (
        <CategoryItem code={item.code} editable={editable} key={item.code} name={item.name} />
      )),
    [data, editable],
  );

  if (isHidden) return null;

  return (
    <Animated.View style={containerStyle}>
      <ScrollView
        contentContainerStyle={$.content}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <CategoryItem code="ALL" name={t("all")} />
        {categoryItems}
      </ScrollView>
    </Animated.View>
  );
};

interface DeleteCategoryButtonProps {
  code: string;
  name: string;
}

const DeleteCategoryButton = memo(({ code, name }: DeleteCategoryButtonProps) => {
  const { theme } = useUnistyles();
  const { mutate: deleteCategory } = useDeleteCategoryMutation();

  const handleDelete = useCallback(() => {
    Alert.alert("Delete Category", `Are you sure you want to delete ${name}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteCategory(code),
      },
    ]);
  }, [deleteCategory, code, name]);

  return (
    <TouchableOpacity onPress={handleDelete} style={$.deleteButton}>
      <IcX color={theme.colors.neutral[500]} height={vs(20)} width={vs(20)} />
    </TouchableOpacity>
  );
});

DeleteCategoryButton.displayName = "DeleteCategoryButton";

interface CategoryItemProps {
  code: string;
  name: string;
  editable?: boolean;
}

const CategoryItem = memo(({ code, name, editable }: CategoryItemProps) => {
  const active = useCategoryStore((state) => state.selectedCategory === code);

  const handleSelect = useCallback(() => {
    useCategoryStore.getState().setSelectedCategory(code);
  }, [code]);

  const showDelete = Boolean(editable && code !== "ALL");
  const right = useMemo(
    () => (showDelete ? <DeleteCategoryButton code={code} name={name} /> : undefined),
    [showDelete, code, name],
  );

  return (
    <Button
      onPress={handleSelect}
      right={right}
      size="md"
      title={name}
      variant={active ? "soft" : "neutral"}
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
    gap: theme.spacing.md,
  },
  deleteButton: {
    marginLeft: theme.spacing.md,
  },
}));

export default memo(CategoryFilter);
