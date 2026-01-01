import { FlashList } from "@shopify/flash-list";
import { Stack, useRouter } from "expo-router";
import { memo } from "react";
import { t } from "@/services/i18n";
import { Alert, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcPlus from "@/assets/icons/plus.svg";
import IcEdit from "@/assets/icons/edit.svg";
import IcTrash from "@/assets/icons/trash.svg";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import EmptyState from "@/components/ui/EmptyState";
import { useVariantStore, type VariantDraft } from "@/store/useVariantStore";
import { useStoreShallow } from "@/hooks/useStoreShallow";
import { vs } from "@/utils/Scale";
import ScreenHeader from "@/components/ui/ScreenHeader";

const ManageVariantsScreen = () => {
    const router = useRouter();
    const { variants, removeVariant, selectVariant } = useStoreShallow(useVariantStore, (s) => ({
        variants: s.variants,
        removeVariant: s.removeVariant,
        selectVariant: s.selectVariant,
    }));

    const handleAddVariant = () => {
        selectVariant(null); // Clear selected for new entry
        router.push("/modal/product/edit-variant");
    };

    const handleEditVariant = (variant: VariantDraft) => {
        selectVariant(variant);
        router.push("/modal/product/edit-variant");
    };

    const handleDeleteVariant = (id: string) => {
        Alert.alert(t("delete_variant"), t("confirm_delete_variant"), [
            { text: t("cancel"), style: "cancel" },
            {
                text: t("delete"),
                style: "destructive",
                onPress: () => removeVariant(id),
            },
        ]);
    };

    return (
        <View style={$.container}>
            <Stack.Screen
                options={{
                    header: () => (
                        <ScreenHeader
                            title={t("manage_variants")}
                            noBack
                            rightAction={
                                <Button
                                    onPress={() => router.back()}
                                    size="md"
                                    title={t("save")}
                                    variant="primary"
                                />
                            }
                        />
                    ),
                }}
            />

            <View style={$.content}>
                <FlashList
                    data={variants}
                    contentContainerStyle={$.listContent}
                    ItemSeparatorComponent={() => <View style={$.listSeparator} />}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <VariantItem
                            item={item}
                            onEdit={() => handleEditVariant(item)}
                            onDelete={() => handleDeleteVariant(item.id)}
                        />
                    )}
                    ListEmptyComponent={
                        <EmptyState
                            title={t("no_variants_title")}
                            subtitle={t("no_variants_subtitle")}
                        />
                    }
                    ListFooterComponent={
                        <Button
                            onPress={handleAddVariant}
                            size="md"
                            title={t("add_new_variant")}
                            variant="soft"
                            style={$.addButton}
                        />}
                />

            </View>
        </View>
    );
};

const VariantItem = memo(({ item, onEdit, onDelete }: { item: VariantDraft; onEdit: () => void; onDelete: () => void }) => {
    return (
        <View style={$.itemContainer}>
            <View style={$.itemContent}>
                <Text style={$.itemName}>{item.name}</Text>
                <Text style={$.itemSubtitle}>
                    {item.options.length} {t("options")} • {item.isRequired ? t("required") : t("optional")}
                </Text>
            </View>
            <View style={$.actions}>
                <IconButton Icon={IcEdit} onPress={onEdit} size="sm" variant="soft" />
                <IconButton Icon={IcTrash} onPress={onDelete} size="sm" variant="warning" />
            </View>
        </View>
    );
});
VariantItem.displayName = "VariantItem";

const $ = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.neutral[100],
    },
    content: {
        flex: 1,
        padding: theme.spacing.xl,
        gap: theme.spacing.lg,
    },
    addButton: {
        marginVertical: theme.spacing.xl,
    },
    listContent: {
        paddingBottom: theme.spacing.xl,
    },
    listSeparator: {
        height: vs(10),
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: theme.spacing.md,
        backgroundColor: theme.colors.neutral[100],
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.neutral[200],
    },
    itemContent: {
        flex: 1,
        gap: vs(4),
    },
    itemName: {
        ...theme.typography.bodyLg,
        color: theme.colors.neutral[700],
        fontWeight: "600",
    },
    itemSubtitle: {
        ...theme.typography.bodySm,
        color: theme.colors.neutral[500],
    },
    actions: {
        flexDirection: "row",
        gap: theme.spacing.sm,
    },
}));

export default ManageVariantsScreen;
