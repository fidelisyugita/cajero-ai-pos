import { useEffect } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Header from "@/components/dashboard/Header";
import CategoryFilter from "@/components/menu/CategoryFilter";
import MenuList from "@/components/menu/MenuList";
import MenuSearchBar from "@/components/menu/MenuSearchBar";
import MenuOrder from "@/components/order/menu-order";
import { useCollapsibleHeader } from "@/hooks/useCollapsibleHeader";
import { useCategoryStore } from "@/store/useMenuCategoryStore";
import { vs } from "@/utils/Scale";

const MenuScreen = () => {
  return (
    <View style={$.container}>
      <View style={$.content}>
        <Header>
          <MenuSearchBar />
        </Header>
        <MenuContent />
      </View>
      <MenuOrder />
    </View>
  );
};

const HEADER_HEIGHT = vs(80);

const MenuContent = () => {
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
    <View style={$.content}>
      <CategoryFilter style={headerAnimatedStyle} />
      <MenuList scrollHandler={scrollHandler} />
    </View>
  );
};

const $ = StyleSheet.create((theme, _rt) => ({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: theme.colors.neutral[200],
  },
  content: {
    flex: 1,
  },
  orderContainer: {
    width: vs(338),
    shadowColor: "#000",
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    backgroundColor: theme.colors.neutral[100],
  },
}));

export default MenuScreen;
