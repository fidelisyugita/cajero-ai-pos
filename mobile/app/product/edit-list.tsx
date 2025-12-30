import { useRef } from "react";
import { View } from "react-native";
import { t } from "@/services/i18n";
import { useSharedValue } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import CategoryFilter from "@/components/menu/CategoryFilter";
import MenuList from "@/components/menu/MenuList";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { Stack } from "expo-router";

import MenuSearchBar from "@/components/menu/MenuSearchBar";

const EditListScreen = () => {
    const scrollY = useSharedValue(0);
    const scrollRef = useRef<any>(null);

    const onScroll = (event: any) => {
        scrollY.value = event.nativeEvent.contentOffset.y;
    };

    return (
        <View style={$.container}>
            <Stack.Screen 
                options={{
                    header: () => (
                        <ScreenHeader 
                            rightAction={<MenuSearchBar />} 
                            title={t("edit_product_category")} 
                        />
                    ),
                    headerShown: true
                }} 
            />
            <CategoryFilter editable style={$.categoryFilter} />
            <MenuList editable scrollHandler={onScroll} />
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
