import { FlashList as ShopifyFlashList, type FlashListProps } from "@shopify/flash-list";
import React, { useState } from "react";

// Workaround for missing estimatedItemSize in FlashList props type definition
const FlashList = ShopifyFlashList as unknown as <T>(
    props: FlashListProps<T> & { estimatedItemSize: number }
) => React.ReactElement;
import { useRouter } from "expo-router";
import { memo } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcEdit from "@/assets/icons/edit.svg";
import IconButton from "@/components/ui/IconButton";
import { useIngredientsQuery } from "@/services/queries/useIngredientsQuery";
import type { Ingredient } from "@/services/types/Ingredient";
import { vs } from "@/utils/Scale";
import Button from "@/components/ui/Button";
import { t } from "@/services/i18n";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import StockUpdateModal from "./StockUpdateModal";
import SaveIngredientModal from "./SaveIngredientModal";
import { useUpdateIngredientStockMutation } from "@/services/mutations/useUpdateIngredientStockMutation";
import { useUpdateIngredientMutation } from "@/services/mutations/useUpdateIngredientMutation";
import Logger from "../../services/logger";


const COLUMNS = [
    { label: "Ingredient Name", flex: 2 },
    { label: "Measure Unit", flex: 1 },
    { label: "Stock", flex: 1 },
    { label: "Status", flex: 1 },
    { label: "Action", flex: 1 },
];

interface StockIngredientsProps {
    onIngredientPress: (ingredient: Ingredient) => void;
    searchQuery?: string;
}

const StockIngredients = ({ onIngredientPress, searchQuery = "" }: StockIngredientsProps) => {
    const { data: ingredients, isLoading } = useIngredientsQuery();
    const updateIngredientStockMutation = useUpdateIngredientStockMutation();
    const updateIngredientMutation = useUpdateIngredientMutation();
    const [stockUpdateTarget, setStockUpdateTarget] = useState<Ingredient | null>(null);
    const [editDetailTarget, setEditDetailTarget] = useState<Ingredient | null>(null);

    const filteredIngredients = (ingredients || []).filter((ingredient) => {
        if (!searchQuery) return true;
        return ingredient.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    const router = useRouter();

    const handleUpdateStock = (newStock: number) => {
        Logger.info("newStock", newStock)
        if (!stockUpdateTarget) return;
        Logger.info("Updating stock for ingredient: ", stockUpdateTarget?.name);



        updateIngredientStockMutation.mutate(
            {
                id: stockUpdateTarget.id,
                stock: newStock,
                reason: "Manual correction via App",
            },
            {
                onSuccess: () => {
                    setStockUpdateTarget(null);
                },
            }
        );
    };

    const handleSaveDetail = (data: { name: string; measureUnitCode: string; description: string }) => {
        if (!editDetailTarget) return;

        updateIngredientMutation.mutate(
            {
                id: editDetailTarget.id,
                data: {
                    ...data,
                    stock: editDetailTarget.stock || 0, // Ensure stock is a number
                }
            },
            {
                onSuccess: () => {
                    setEditDetailTarget(null);
                }
            }
        );
    };

    const renderSkeleton = () => (
        <View style={$.container}>
            <View style={$.header}>
                {COLUMNS.map((col) => (
                    <Skeleton
                        key={col.label}
                        style={{ flex: col.flex, marginRight: 10 }}
                        height={20}
                    />
                ))}
            </View>
            <View style={$.listContent}>
                {[...Array(10)].map((_, index) => (
                    <View key={index} style={$.row}>
                        {COLUMNS.map((col, cIndex) => (
                            <Skeleton
                                key={cIndex}
                                style={{ flex: col.flex, marginRight: 10 }}
                                height={20}
                            />
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );

    if (isLoading) {
        return renderSkeleton();
    }

    return (
        <View style={$.container}>
            {filteredIngredients && filteredIngredients.length > 0 && (
                <View style={$.header}>
                    {COLUMNS.map((col) => (
                        <Text key={col.label} style={[$.headerText, { flex: col.flex }]}>
                            {col.label}
                        </Text>
                    ))}
                </View>
            )}
            <FlashList<Ingredient>
                contentContainerStyle={[$.listContent, (!filteredIngredients || filteredIngredients.length === 0) && { flex: 1 }]}
                data={filteredIngredients || []}
                estimatedItemSize={60}
                keyExtractor={(item: Ingredient) => item.id}
                renderItem={({ item }: { item: Ingredient }) => (
                    <StockRow
                        item={item}
                        onHistoryPress={() => onIngredientPress(item)}
                        onEditPress={() => setEditDetailTarget(item)}
                        onStockUpdatePress={() => setStockUpdateTarget(item)}
                    />
                )}
                ItemSeparatorComponent={() => <View style={$.separator} />}
                ListEmptyComponent={
                    <EmptyState
                        title={t("empty_ingredients_title")}
                        subtitle={t("empty_ingredients_subtitle")}
                    />
                }
            />

            {stockUpdateTarget && (
                <StockUpdateModal
                    visible={!!stockUpdateTarget}
                    onClose={() => setStockUpdateTarget(null)}
                    onSave={handleUpdateStock}
                    currentStock={stockUpdateTarget.stock}
                    itemName={stockUpdateTarget.name}
                    isLoading={updateIngredientStockMutation.isPending}
                />
            )}

            {editDetailTarget && (
                <SaveIngredientModal
                    visible={!!editDetailTarget}
                    onClose={() => setEditDetailTarget(null)}
                    onSave={handleSaveDetail}
                    ingredient={editDetailTarget}
                    isLoading={updateIngredientMutation.isPending}
                />
            )}
        </View>
    );
};

const StockRow = memo(({ item, onHistoryPress, onEditPress, onStockUpdatePress }: { item: Ingredient; onHistoryPress: () => void; onEditPress: () => void; onStockUpdatePress: () => void }) => {
    let status = "In Stock";
    let statusVariant: "active" | "inactive" | "warning" = "active";

    if (item.stock <= 0) {
        status = "Out of Stock";
        statusVariant = "inactive";
    } else if (item.stock < 50) {
        status = "Low Stock";
        statusVariant = "warning";
    }

    return (
        <View style={$.row} >
            <Text style={[$.cellText, { flex: COLUMNS[0].flex }]}>{item.name}</Text>
            <Text style={[$.cellText, { flex: COLUMNS[1].flex }]}>{item.measureUnitCode}</Text>
            <View style={{ flex: COLUMNS[2].flex, flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', ...$.cellText, paddingRight: 0 }}>{item.stock}</Text>
                <IconButton
                    Icon={IcEdit}
                    onPress={onStockUpdatePress}
                    size="sm"
                    variant="neutral-no-stroke"
                />
            </View>
            <View style={{ flex: COLUMNS[3].flex }}>
                <StatusBadge variant={statusVariant} label={status} />
            </View>
            <View style={[$.actionContainer, { flex: COLUMNS[4].flex }]}>
                <Button
                    size="sm"
                    title="Edit"
                    variant="neutral"
                    onPress={onEditPress}
                />
                <Button
                    size="sm"
                    title="History"
                    variant="neutral"
                    onPress={onHistoryPress}
                />
            </View>
        </View>
    );
});

const StatusBadge = ({ variant, label }: { variant: "active" | "inactive" | "warning", label: string }) => {
    $.useVariants({ status: variant });
    return (
        <View style={$.badge}>
            <Text style={$.badgeText}>{label}</Text>
        </View>
    );
}

const $ = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.neutral[100],
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.sup.red,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral[300],
    },
    headerText: {
        ...theme.typography.labelMd,
        color: theme.colors.neutral[700],
    },
    listContent: {
        paddingHorizontal: theme.spacing.lg,
    },
    separator: {
        height: 1,
        backgroundColor: theme.colors.neutral[200],
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: theme.spacing.md,
    },
    cellText: {
        ...theme.typography.bodyMd,
        color: theme.colors.neutral[700],
        paddingRight: theme.spacing.sm,
    },
    badge: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        alignSelf: "flex-start",
        variants: {
            status: {
                active: {
                    backgroundColor: theme.colors.positive[100],
                    borderColor: theme.colors.positive[300],
                },
                inactive: {
                    backgroundColor: theme.colors.error[100], // Using error color for inactive/out of stock
                    borderColor: theme.colors.error[300],
                },
                warning: {
                    backgroundColor: theme.colors.warning[100],
                    borderColor: theme.colors.warning[300],
                },
            },
        },
    },
    badgeText: {
        ...theme.typography.labelSm,
        variants: {
            status: {
                active: {
                    color: theme.colors.positive[500],
                },
                inactive: {
                    color: theme.colors.error[500],
                },
                warning: {
                    color: theme.colors.warning[500],
                },
            },
        },
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    }
}));

export default StockIngredients;
