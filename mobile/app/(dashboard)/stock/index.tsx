import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { t } from "@/services/i18n";
import StockIngredients from "@/components/stock/StockIngredients";
import { useState } from "react";
import type { Ingredient } from "@/services/types/Ingredient";
import Header from "@/components/dashboard/Header";
import SegmentedControl from "@/components/ui/SegmentedControl";
import StockProducts from "@/components/stock/StockProducts";
import StockIngredientHistory from "@/components/stock/StockIngredientHistory";

import SearchBar from "@/components/ui/SearchBar";

type Tab = "Ingredients" | "Products";

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
                    options={[
                        { label: t("ingredients"), value: "Ingredients" },
                        { label: t("products"), value: "Products" },
                    ]}
                    value={activeTab}
                    onChange={setActiveTab}
                />
            </Header>
            <View style={$.content}>
                {activeTab === "Ingredients" ? (
                    <StockIngredients onIngredientPress={setSelectedIngredient} searchQuery={searchQuery} />
                ) : (
                    <StockProducts searchQuery={searchQuery} />
                )}
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
