import { Stack } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import CategoryFilter from "@/components/menu/CategoryFilter";
import MenuList from "@/components/menu/MenuList";
import MenuSearchBar from "@/components/menu/MenuSearchBar";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useCollapsibleHeader } from "@/hooks/useCollapsibleHeader";
import { t } from "@/services/i18n";
import { useCategoryStore } from "@/store/useMenuCategoryStore";
import { vs } from "@/utils/Scale";

const HEADER_HEIGHT = vs(80);

const EditListScreen = () => {
  const selectedCategory = useCategoryStore((s) => s.selectedCategory);
  const searchQuery = useCategoryStore((s) => s.searchQuery);
  const { scrollHandler, headerAnimatedStyle, reset } = useCollapsibleHeader({
    headerHeight: HEADER_HEIGHT,
  });

  useEffect(() => {
    if (selectedCategory || searchQuery !== undefined) {
      reset();
    }
  }, [selectedCategory, searchQuery, reset]);

  return (
    <View style={$.container}>
      <Stack.Screen
        options={{
          header: () => (
            <ScreenHeader rightAction={<MenuSearchBar />} title={t("edit_product_category")} />
          ),
          headerShown: true,
        }}
      />
      <CategoryFilter editable style={[$.categoryFilter, headerAnimatedStyle]} />
      <MenuList editable scrollHandler={scrollHandler} />
    </View>
  );
};

const $ = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[200],
  },
  categoryFilter: {
    marginTop: theme.spacing.xl,
  },
}));

export default EditListScreen;
