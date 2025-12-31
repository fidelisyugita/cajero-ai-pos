import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useStockMovementsQuery } from "@/services/queries/useStockMovementsQuery";
import { AnimatedFlashList as ShopifyAnimatedFlashList, type FlashListProps } from "@shopify/flash-list";
import React from "react";

// Workaround for missing estimatedItemSize in FlashList props type definition
const AnimatedFlashList = ShopifyAnimatedFlashList as unknown as <T>(
    props: FlashListProps<T> & { estimatedItemSize: number }
) => React.ReactElement;
import dayjs from "dayjs";
import type { Ingredient } from "@/services/types/Ingredient";

import type { StockMovement } from "@/services/types/StockMovement";

interface StockIngredientHistoryProps {
    ingredient: Ingredient | null;
    onClose: () => void;
}

const StockIngredientHistory = ({ ingredient, onClose }: StockIngredientHistoryProps) => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useStockMovementsQuery({
        ingredientId: ingredient?.id,
        size: 20,
        sort: 'createdAt,desc'
    });

    const movements = data?.pages.flatMap((page: any) => page.content) || [];

    if (!ingredient) return null;

    return (
        <Modal visible={!!ingredient} animationType="slide" transparent onRequestClose={onClose}>
            <TouchableOpacity style={$.modalOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableWithoutFeedback>
                    <View style={$.modalContent}>
                        <View style={$.header}>
                            <Text style={$.title}>Stock History: {ingredient.name}</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Text style={$.closeButton}>Close</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={$.headerRow}>
                            <Text style={$.headerCell}>Date</Text>
                            <Text style={$.headerCell}>Type</Text>
                            <Text style={$.headerCell}>Qty</Text>
                            <Text style={$.headerCell}>By</Text>
                            <Text style={[$.headerCell, { flex: 2 }]}>Info</Text>
                        </View>

                        <AnimatedFlashList
                            data={movements}
                            estimatedItemSize={50}
                            keyExtractor={(item: StockMovement) => item.id}
                            onEndReached={() => {
                                if (hasNextPage) fetchNextPage();
                            }}
                            onEndReachedThreshold={0.5}
                            renderItem={({ item }: { item: StockMovement }) => (
                                <View style={$.row}>
                                    <Text style={$.cell}>{dayjs.utc(item.createdAt).local().format("DD/MM/YY HH:mm")}</Text>
                                    <Text style={[$.cell, { color: item.type === 'IN' ? 'green' : 'red' }]}>{item.type}</Text>
                                    <Text style={$.cell}>{item.quantity}</Text>
                                    <Text style={$.cell}>{item.createdByName || '-'}</Text>
                                    <Text style={[$.cell, { flex: 2 }]} numberOfLines={2}>{item.transactionDescription || '-'}</Text>
                                </View>
                            )}
                            ListEmptyComponent={<Text style={$.emptyText}>No history found.</Text>}
                            ListFooterComponent={isFetchingNextPage ? <Text style={{ textAlign: 'center', padding: 10 }}>Loading more...</Text> : null}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
};

const $ = StyleSheet.create((theme) => ({
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.colors.transparentModal,
        justifyContent: "center",
        alignItems: "center",
        padding: theme.spacing.xl,
    },
    modalContent: {
        backgroundColor: theme.colors.neutral[100],
        borderRadius: theme.radius.md,
        width: "100%",
        height: "80%",
        padding: theme.spacing.lg,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: theme.spacing.lg,
    },
    title: {
        ...theme.typography.heading4,
    },
    closeButton: {
        color: theme.colors.primary[500],
        ...theme.typography.labelMd,
    },
    headerRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral[200],
        paddingBottom: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    headerCell: {
        flex: 1,
        ...theme.typography.labelSm,
        fontWeight: "bold",
    },
    row: {
        flexDirection: "row",
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral[100],
    },
    cell: {
        flex: 1,
        ...theme.typography.bodyMd,
    },
    emptyText: {
        textAlign: "center",
        marginTop: theme.spacing.xl,
        color: theme.colors.neutral[500],
    }
}));

export default StockIngredientHistory;
