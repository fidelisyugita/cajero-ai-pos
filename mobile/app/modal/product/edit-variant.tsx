import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { t } from "@/services/i18n";
import { Alert, Text, View, ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcPlus from "@/assets/icons/plus.svg";
import IcTrash from "@/assets/icons/trash.svg";
import IcX from "@/assets/icons/x.svg";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import Switch from "@/components/ui/Switch";
import ScreenModal from "@/components/ui/ScreenModal";
import FormSectionCard from "@/components/ui/FormSectionCard";
import { useVariantStore, type VariantDraft } from "@/store/useVariantStore";
import { useStoreShallow } from "@/hooks/useStoreShallow";
import { vs } from "@/utils/Scale";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "@/components/ui/Select";
import { useIngredientsQuery } from "@/services/queries/useIngredientsQuery";

const variantSchema = z.object({
    name: z.string().min(1, "Name is required"),
    isRequired: z.boolean(),
    isMultiple: z.boolean(),
    options: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, "Option name is required"),
        stock: z.coerce.number().min(0, "Stock must be positive"),
        priceAdjusment: z.coerce.number().min(0, "Price adjustment must be positive"),
        ingredients: z.array(z.object({
            ingredientId: z.string(),
            name: z.string(), // Just for display/draft
            quantityNeeded: z.coerce.number().min(0.0001, "Quantity must be greater than 0"),
            measureUnit: z.string().optional(),
        })).optional(),
    })).min(1, "At least one option is required"),
});

type VariantFormData = z.infer<typeof variantSchema>;

const createTempId = () => Math.random().toString(36).substring(2, 9);

const EditVariantModal = () => {
    const router = useRouter();
    const { selectedVariant, addVariant, updateVariant } = useStoreShallow(useVariantStore, (s) => ({
        selectedVariant: s.selectedVariant,
        addVariant: s.addVariant,
        updateVariant: s.updateVariant,
    }));

    const { control, handleSubmit, reset, formState: { errors } } = useForm<VariantFormData>({
        resolver: zodResolver(variantSchema),
        defaultValues: {
            name: "",
            isRequired: true,
            isMultiple: false,
            options: [{ id: createTempId(), name: "", stock: 0, priceAdjusment: 0, ingredients: [] }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "options",
    });

    const { data: ingredientsData } = useIngredientsQuery();
    const ingredientOptions = ingredientsData?.map(i => ({ label: i.name, value: i.id })) || [];

    useEffect(() => {
        if (selectedVariant) {
            reset({
                name: selectedVariant.name,
                isRequired: selectedVariant.isRequired,
                isMultiple: selectedVariant.isMultiple,
                options: selectedVariant.options.map(opt => ({
                    id: opt.id,
                    name: opt.name,
                    stock: opt.stock,
                    priceAdjusment: opt.priceAdjusment,
                    ingredients: opt.ingredients?.map(ing => ({
                        ingredientId: ing.ingredientId,
                        name: ing.name,
                        quantityNeeded: ing.quantityNeeded,
                        measureUnit: ing.measureUnit
                    })) || []
                }))
            });
        }
    }, [selectedVariant, reset]);

    const onSubmit = (data: VariantFormData) => {
        const variantDraft: VariantDraft = {
            id: selectedVariant?.id || createTempId(),
            name: data.name,
            isRequired: data.isRequired,
            isMultiple: data.isMultiple,
            options: data.options,
            isNew: !selectedVariant || selectedVariant.isNew,
        };

        if (selectedVariant) {
            updateVariant(selectedVariant.id, variantDraft);
        } else {
            addVariant(variantDraft);
        }
        router.back();
    };

    return (
        <ScreenModal modalStyle={$.modal}>
            <ScreenModal.Header title={selectedVariant ? t("edit_variant") : t("add_variant")} />
            <ScreenModal.Body>
                <ScrollView contentContainerStyle={$.container}>
                    <FormSectionCard title={t("variant_details")} required>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <Input
                                    label={t("variant_name")}
                                    placeholder={t("e_g_size_color")}
                                    value={value}
                                    onChangeText={onChange}
                                    error={error?.message}
                                    size="lg"
                                />
                            )}
                        />
                        <View style={$.switchRow}>
                            <Text style={$.switchLabel}>{t("required")}</Text>
                            <Controller
                                control={control}
                                name="isRequired"
                                render={({ field: { onChange, value } }) => (
                                    <Switch value={value} onValueChange={onChange} />
                                )}
                            />
                        </View>
                        <View style={$.switchRow}>
                            <Text style={$.switchLabel}>{t("multiple_selection")}</Text>
                            <Controller
                                control={control}
                                name="isMultiple"
                                render={({ field: { onChange, value } }) => (
                                    <Switch value={value} onValueChange={onChange} />
                                )}
                            />
                        </View>
                    </FormSectionCard>

                    <FormSectionCard title={t("options")} required>
                        {fields.map((field, index) => (
                            <VariantOptionItem
                                key={field.id}
                                control={control}
                                index={index}
                                remove={() => remove(index)}
                                canRemove={fields.length > 1}
                                ingredientOptions={ingredientOptions}
                                allIngredients={ingredientsData || []}
                            />
                        ))}
                        <Button
                            leftIcon={() => <IcPlus color="white" />}
                            onPress={() => append({ id: createTempId(), name: "", stock: 0, priceAdjusment: 0, ingredients: [] })}
                            size="sm"
                            title={t("add_option")}
                            variant="primary"
                            style={{ alignSelf: 'flex-start' }}
                        />
                        {errors.options && <Text style={$.errorText}>{errors.options.message}</Text>}
                    </FormSectionCard>
                </ScrollView>
            </ScreenModal.Body>
            <ScreenModal.Footer>
                <Button
                    onPress={() => router.back()}
                    size="md"
                    style={$.flex}
                    title={t("cancel")}
                    variant="secondary"
                />
                <Button
                    onPress={handleSubmit(onSubmit)}
                    size="md"
                    style={$.flex}
                    title={t("save")}
                    variant="primary"
                />
            </ScreenModal.Footer>
        </ScreenModal>
    );
};

const VariantOptionItem = ({ control, index, remove, canRemove, ingredientOptions, allIngredients }: any) => {
    const { fields, append, remove: removeIngredient } = useFieldArray({
        control,
        name: `options.${index}.ingredients`,
    });

    return (
        <View style={$.optionCard}>
            <View style={$.optionHeader}>
                <Text style={$.optionTitle}>{t("option")} {index + 1}</Text>
                <IconButton
                    Icon={IcTrash}
                    onPress={remove}
                    size="sm"
                    variant="warning"
                    disabled={!canRemove}
                />
            </View>

            <View style={$.optionRow}>
                <View style={[$.optionInputs, { flexDirection: 'column' }]}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Controller
                            control={control}
                            name={`options.${index}.name`}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <Input
                                    label={t("name")}
                                    value={value}
                                    onChangeText={onChange}
                                    error={error?.message}
                                    size="md"
                                    containerStyle={{ flex: 1.5 }}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name={`options.${index}.priceAdjusment`}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <Input
                                    label={t("price_adj")}
                                    value={value.toString()}
                                    onChangeText={onChange}
                                    error={error?.message}
                                    keyboardType="numeric"
                                    size="md"
                                    containerStyle={{ flex: 1 }}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name={`options.${index}.stock`}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <Input
                                    label={t("stock")}
                                    value={value.toString()}
                                    onChangeText={onChange}
                                    error={error?.message}
                                    keyboardType="numeric"
                                    size="md"
                                    containerStyle={{ flex: 1 }}
                                />
                            )}
                        />
                    </View>
                </View>
            </View>

            {/* Ingredients Section */}
            <View style={$.ingredientsSection}>
                <Text style={$.ingredientsTitle}>{t("ingredients")}</Text>
                {fields.map((field: any, ingIndex: number) => (
                    <View key={field.id} style={$.ingredientRow}>
                        <Controller
                            control={control}
                            name={`options.${index}.ingredients.${ingIndex}.ingredientId`}
                            render={({ field: { onChange, value } }) => (
                                <Select
                                    // label={t("ingredient")}
                                    options={ingredientOptions}
                                    value={value}
                                    onSelect={(val) => {
                                        onChange(val);
                                    }}
                                    containerStyle={{ flex: 2, }}
                                    placeholder={t("select_ingredient")}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name={`options.${index}.ingredients.${ingIndex}.quantityNeeded`}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <Input
                                    label={t("qty")}
                                    value={value?.toString()}
                                    onChangeText={onChange}
                                    keyboardType="numeric"
                                    size="md"
                                    containerStyle={{ flex: 1 }}
                                    error={error?.message}
                                />
                            )}
                        />
                        <IconButton
                            Icon={IcX}
                            onPress={() => removeIngredient(ingIndex)}
                            size="sm"
                            variant="secondary-warning"
                        // style={{ marginTop: 28 }} // Align with inputs
                        />
                    </View>
                ))}
                <Button
                    leftIcon={() => <IcPlus color="white" />}
                    onPress={() => append({ ingredientId: "", name: "", quantityNeeded: 0, measureUnit: "" })}
                    size="sm"
                    title={t("add_ingredient")}
                    variant="soft"
                    style={{ alignSelf: 'flex-start' }}
                />
            </View>
        </View>
    );
};

const $ = StyleSheet.create((theme) => ({
    modal: {
        width: vs(649),
        height: "90%",
    },
    container: {
        padding: theme.spacing.xl,
        gap: theme.spacing.lg,
    },
    flex: {
        flex: 1,
    },
    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: theme.spacing.xs,
    },
    switchLabel: {
        ...theme.typography.bodyMd,
        color: theme.colors.neutral[700],
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    optionInputs: {
        flex: 1,
        flexDirection: 'row',
        gap: theme.spacing.xs,
    },
    errorText: {
        ...theme.typography.bodySm,
        color: theme.colors.error[500],
        marginTop: theme.spacing.xs,
    },
    optionCard: {
        backgroundColor: theme.colors.neutral[100],
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
        gap: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    optionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionTitle: {
        ...theme.typography.bodyMd,
        fontWeight: '600',
        color: theme.colors.neutral[700],
    },
    ingredientsSection: {
        gap: theme.spacing.sm,
        marginTop: theme.spacing.xs,
        paddingTop: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.neutral[200],
    },
    ingredientsTitle: {
        ...theme.typography.bodySm,
        fontWeight: '600',
        color: theme.colors.neutral[500],
    },
    ingredientRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        alignItems: 'center',
    }
}));

export default EditVariantModal;
