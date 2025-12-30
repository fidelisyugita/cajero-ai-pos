import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { t } from "@/services/i18n";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { z } from "zod";
import IcAddImage from "@/assets/icons/add-image.svg";
import IcUpload from "@/assets/icons/upload.svg";

import Button from "@/components/ui/Button";
import FormSectionCard from "@/components/ui/FormSectionCard";
import KeyboardForm from "@/components/ui/KeyboardForm";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Input from "@/components/ui/Input";
import Switch from "@/components/ui/Switch";
import { useUploadImageMutation } from "@/services/mutations/useUploadImageMutation";
import { useCreatePettyCashMutation } from "@/services/mutations/useCreatePettyCashMutation";
import useImageSelectionStore from "@/store/useImageSelectionStore";
import { formatCurrency, parseCurrency } from "@/utils/Format";
import { vs } from "@/utils/Scale";
import Logger from "@/services/logger";

const UniIcAddImage = withUnistyles(IcAddImage, (theme) => ({
    color: theme.colors.neutral[600],
    width: vs(80),
    height: vs(80),
}));

const UniIcUpload = withUnistyles(IcUpload, (theme) => ({
    color: theme.colors.primary[400],
    width: vs(20),
    height: vs(20),
}));

const expenseSchema = z.object({
    imageUrl: z.string().optional(),
    description: z.string().min(2, "Description must be at least 2 characters").max(255),
    amount: z.number().min(1, "Amount must be positive"),
    isIncome: z.boolean(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

const AddExpense = () => {
    const router = useRouter();
    const { mutateAsync: addExpense } = useCreatePettyCashMutation();
    const { mutateAsync: uploadImage } = useUploadImageMutation();
    const { setImageUri } = useImageSelectionStore();

    const {
        control,
        handleSubmit,
        setValue,
        formState: { isSubmitting },
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            description: "",
            amount: 0,
            isIncome: false, // Default to Expense
        },
    });

    const handleUploadImagePress = (imageUri?: string) => {
        const currentImageUri = useImageSelectionStore.getState().imageUri;
        useImageSelectionStore.setState({
            onImageUploaded: (uri) => {
                setValue("imageUrl", uri);
            },
            imageUri: imageUri && !currentImageUri ? imageUri : currentImageUri,
        });
        router.push({
            pathname: "/modal/product/upload-image",
            params: { title: "Receipt / Image" },
        });
    };

    const onSubmit = async (data: ExpenseFormData) => {
        try {
            let uploadedImageUrl = data.imageUrl;

            if (data.imageUrl && !data.imageUrl.startsWith("http")) {
                uploadedImageUrl = await uploadImage({
                    fileUri: data.imageUrl,
                    type: "petty-cash"
                });
            }

            await addExpense({
                ...data,
                imageUrl: uploadedImageUrl,
            });

            Alert.alert(t("success"), t("expense_added_success"), [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Logger.error("Add expense failed:", error);
            Alert.alert(t("failed"), error.message || "Failed to add expense");
        }
    };

    return (
        <View style={$.container}>
            <Stack.Screen
                options={{
                    header: () => (
                        <ScreenHeader
                            rightAction={
                                <Button
                                    isLoading={isSubmitting}
                                    onPress={handleSubmit(onSubmit)}
                                    size="md"
                                    title={t("save")}
                                    variant="primary"
                                />
                            }
                            title={t("add_expense_title")}
                        />
                    ),
                }}
            />

            <KeyboardForm contentContainerStyle={$.scrollContent} style={$.flex}>
                <View style={$.section}>
                    {/* Image Section */}
                    <FormSectionCard title={t("receipt_image")}>
                        <Controller
                            control={control}
                            name="imageUrl"
                            render={({ field: { value } }) => (
                                <>
                                    {value ? (
                                        <Image contentFit="cover" source={value} style={$.image} />
                                    ) : (
                                        <View style={$.imagePlaceholder}>
                                            <UniIcAddImage />
                                        </View>
                                    )}
                                    <View style={$.uploadRow}>
                                        <Text style={$.uploadText}>
                                            {t("upload_receipt_or_select_image")}
                                        </Text>
                                        <Button
                                            leftIcon={() => <UniIcUpload />}
                                            onPress={() => handleUploadImagePress(value)}
                                            size="md"
                                            title={t("upload")}
                                            variant="soft"
                                        />
                                    </View>
                                </>
                            )}
                        />
                    </FormSectionCard>

                    {/* Information Section */}
                    <FormSectionCard required title={t("expense_information")}>
                        <Controller
                            control={control}
                            name="description"
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <Input
                                    editable={!isSubmitting}
                                    error={error?.message}
                                    label={t("description_required")}
                                    onChangeText={onChange}
                                    value={value}
                                    size="lg"
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="amount"
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <Input
                                    editable={!isSubmitting}
                                    error={error?.message}
                                    keyboardType="numeric"
                                    label={t("amount_required")}
                                    onChangeText={(text) => onChange(parseCurrency(text))}
                                    value={value ? formatCurrency(value) : ""}
                                    size="lg"
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="isIncome"
                            render={({ field: { onChange, value } }) => (
                                <View style={$.switchRow}>
                                    <Text style={$.label}>{t("transaction_type")}</Text>
                                    <View style={$.switchContainer}>
                                        <Text style={[$.switchLabel, !value && $.activeLabel]}>{t("expense")}</Text>
                                        <Switch value={value} onValueChange={onChange} />
                                        <Text style={[$.switchLabel, value && $.activeLabel]}>{t("income")}</Text>
                                    </View>
                                </View>
                            )}
                        />
                    </FormSectionCard>
                </View>
            </KeyboardForm>
        </View>
    );
};

const $ = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.neutral[200],
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.xl,
        gap: theme.spacing.xl,
        maxWidth: 800,
        width: "100%",
        alignSelf: "center",
    },
    section: {
        gap: theme.spacing.lg,
    },
    imageSection: {
        alignItems: "center",
    },
    image: {
        width: "100%",
        height: vs(200),
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.neutral[100],
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
    },
    imagePlaceholder: {
        width: "100%",
        height: vs(200),
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.neutral[100],
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
        borderStyle: "dashed",
    },
    uploadRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginTop: theme.spacing.md,
    },
    uploadText: {
        ...theme.typography.bodySm,
        color: theme.colors.neutral[600],
    },
    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: theme.spacing.sm,
    },
    label: {
        ...theme.typography.labelMd,
        color: theme.colors.neutral[700],
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
    },
    switchLabel: {
        ...theme.typography.bodyMd,
        color: theme.colors.neutral[500],
    },
    activeLabel: {
        color: theme.colors.neutral[700],
        fontWeight: "600",
    }
}));

export default AddExpense;
