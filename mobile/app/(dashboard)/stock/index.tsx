import { useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Header from "@/components/dashboard/Header";
import StockIngredientHistory from "@/components/stock/StockIngredientHistory";
import StockIngredients from "@/components/stock/StockIngredients";
import StockProducts from "@/components/stock/StockProducts";
import StockVariants from "@/components/stock/StockVariants";
import SearchBar from "@/components/ui/SearchBar";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { t } from "@/services/i18n";
import type { Ingredient } from "@/services/types/Ingredient";

type Tab = "Ingredients" | "Products" | "Variants";

const renderTabContent = (
  activeTab: Tab,
  searchQuery: string,
  onIngredientPress: (ingredient: Ingredient) => void,
) => {
  if (activeTab === "Ingredients") {
    return <StockIngredients onIngredientPress={onIngredientPress} searchQuery={searchQuery} />;
  }
  if (activeTab === "Products") {
    return <StockProducts searchQuery={searchQuery} />;
  }
  return <StockVariants searchQuery={searchQuery} />;
};

const StockScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Ingredients");
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View style={$.container}>
      <Header>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${activeTab}`}
        />
        <SegmentedControl
          options={
            [
              { label: t("ingredients"), value: "Ingredients" },
              { label: t("products"), value: "Products" },
            ] as { label: string; value: Tab }[]
          }
          value={activeTab}
          onChange={setActiveTab}
        />
      </Header>
      <View style={$.content}>
        {renderTabContent(activeTab, searchQuery, setSelectedIngredient)}
      </View>
      {selectedIngredient && (
        <StockIngredientHistory
          ingredient={selectedIngredient}
          onClose={() => setSelectedIngredient(null)}
        />
      )}
    </View>
  );
};

const $ = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[200],
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    paddingTop: 0,
  },
}));

export default StockScreen;
