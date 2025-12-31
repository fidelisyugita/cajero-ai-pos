import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { t } from "@/services/i18n";
import { Alert, Text, View, ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcPlus from "@/assets/icons/plus.svg";
import IcTrash from "@/assets/icons/trash.svg";
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

const variantSchema = z.object({
    name: z.string().min(1, "Name is required"),
    isRequired: z.boolean(),
    isMultiple: z.boolean(),
    options: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, "Option name is required"),
        stock: z.coerce.number().min(0, "Stock must be positive"),
        priceAdjusment: z.coerce.number().min(0, "Price adjustment must be positive"),
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
            options: [{ id: createTempId(), name: "", stock: 0, priceAdjusment: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "options",
    });

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
                    priceAdjusment: opt.priceAdjusment
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
                             <View key={field.id} style={$.optionRow}>
                                <View style={$.optionInputs}>
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
                                                containerStyle={{ flex: 2 }}
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
                                                onChangeText={onChange} // Zod coerce will handle string -> number
                                                error={error?.message}
                                                keyboardType="numeric"
                                                size="md"
                                                containerStyle={{ flex: 1 }}
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
                                </View>
                                <IconButton
                                    Icon={IcTrash}
                                    onPress={() => remove(index)}
                                    size="sm"
                                    variant="warning"
                                    disabled={fields.length <= 1}
                                />
                             </View>
                         ))}
                         <Button
                            leftIcon={() => <IcPlus color="white" />}
                            onPress={() => append({ id: createTempId(), name: "", stock: 0, priceAdjusment: 0 })}
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
    }
}));

export default EditVariantModal;
