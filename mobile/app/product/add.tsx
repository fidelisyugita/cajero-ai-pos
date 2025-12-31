import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { t } from "@/services/i18n";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { z } from "zod";
import IcAddImage from "@/assets/icons/add-image.svg";
import IcInfo from "@/assets/icons/info.svg";
import IcUpload from "@/assets/icons/upload.svg";
import IcX from "@/assets/icons/x.svg";

import Button from "@/components/ui/Button";
import FormSectionCard from "@/components/ui/FormSectionCard";
import KeyboardForm from "@/components/ui/KeyboardForm";
import IconButton from "@/components/ui/IconButton";
import Switch from "@/components/ui/Switch";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Input from "@/components/ui/Input";
import { useCategoryStore } from "@/store/useProductCategoryStore";
import { useProductCategoriesQuery } from "@/services/queries/useProductCategoriesQuery";
import { useMeasureUnitsQuery } from "@/services/queries/useMeasureUnitsQuery";
import { useUploadImageMutation } from "@/services/mutations/useUploadImageMutation";
import { useMeasureUnitStore } from "@/store/useMeasureUnitStore";
import useImageSelectionStore from "@/store/useImageSelectionStore";
import { useIngredientStore } from "@/store/useIngredientStore";
import { useCreateProductMutation } from "@/services/mutations/useCreateProductMutation";
import { useAuthStore } from "@/store/useAuthStore";
import { useProductQuery } from "@/services/queries/useProductQuery";
import { useUpdateProductMutation } from "@/services/mutations/useUpdateProductMutation";
import { useDeleteProductMutation } from "@/services/mutations/useDeleteProductMutation";
import { useRestoreProductMutation } from "@/services/mutations/useRestoreProductMutation";
import {
	formatCurrency,
	formatNumber,
	parseCurrency,
	parseNumber,
} from "@/utils/Format";
import { vs } from "@/utils/Scale";
import Logger from "@/services/logger";
import { useVariantStore, type VariantDraft } from "@/store/useVariantStore";
import { useCreateVariantMutation } from "@/services/mutations/useCreateVariantMutation";
import { useUpdateVariantMutation } from "@/services/mutations/useUpdateVariantMutation";
import { useDeleteVariantMutation } from "@/services/mutations/useDeleteVariantMutation";
import { useVariantsQuery } from "@/services/queries/useVariantsQuery";

const DEFAULT_TAX = 10;

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

const UniIcInfo = withUnistyles(IcInfo, (theme) => ({
	color: theme.colors.neutral[600],
	width: vs(20),
	height: vs(20),
}));

const productSchema = z.object({
	imageUrl: z.url("Invalid image URL").optional(),
	name: z.string().min(2, "Name must be at least 2 characters"),
	sellingPrice: z.number().min(0, "Price must be a positive number"),
	buyingPrice: z
		.number()
		.min(0, "Buying Price must be a positive number")
		.optional(),
	category: z.object({
		code: z.string().min(2, "Category code must be at least 2 characters"),
		name: z.string().min(2, "Category name must be at least 2 characters"),
	}),
	measureUnit: z.object({
		code: z.string().min(2, "Measure unit code must be at least 2 characters"),
		name: z.string().min(2, "Measure unit name must be at least 2 characters"),
	}),
	commission: z
		.number()
		.min(0, "Commission must be a positive number")
		.optional(),
	description: z
		.string()
		.max(500, "Description must be less than 500 characters")
		.optional(),
	stock: z.number().min(0, "Stock must be a positive number").optional(),
	code: z.string().min(2, "Code must be at least 2 characters").or(z.literal("")).optional(),
	tax: z.number().min(0, "Tax must be a positive number").optional(),
	productIngredients: z.array(
		z
			.object({
				ingredientId: z
					.string()
					.min(2, "Ingredient ID must be at least 2 characters"),
				quantityNeeded: z.number().min(0, "Quantity must be a positive number"),
				name: z.string().optional(),
				unit: z.string().optional(),
			})
			.optional(),
	),
});

type ProductFormData = z.infer<typeof productSchema>;

const AddProduct = () => {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const isEditing = !!id;

	// const [isStockManagementEnabled, setIsStockManagementEnabled] =
	// 	useState<boolean>(false);

	const { mutateAsync: addProduct } = useCreateProductMutation();
	const { mutateAsync: updateProduct } = useUpdateProductMutation();
	const { mutateAsync: deleteProduct } = useDeleteProductMutation();
	const { mutateAsync: restoreProduct } = useRestoreProductMutation();
	const { mutateAsync: uploadImage } = useUploadImageMutation();
	const { data: productToEdit } = useProductQuery(id!, isEditing);
	const { data: categories } = useProductCategoriesQuery();
	const { data: measureUnits } = useMeasureUnitsQuery();

	const {
		reset: resetImageSelectionStore,
		setImageUri,
	} = useImageSelectionStore();
	const {
		reset: resetCategoryStore,
		setSaveCallback: setSaveCategoryCallback,
	} = useCategoryStore();

	const {
		reset: resetMeasureUnitStore,
		setSaveCallback: setSaveMeasureUnitCallback,
	} = useMeasureUnitStore();

	const {
		reset: resetIngredientStore,
		setSaveCallback: setSaveIngredientCallback,
	} = useIngredientStore();

	const {
		setVariants,
		variants: storeVariants,
		deletedVariantIds,
		reset: resetVariantStore,
	} = useVariantStore();

	const { mutateAsync: createVariant } = useCreateVariantMutation();
	const { mutateAsync: updateVariant } = useUpdateVariantMutation();
	const { mutateAsync: deleteVariant } = useDeleteVariantMutation();
	const { data: allVariants } = useVariantsQuery();

	// Local state to store tax percentage for display and calculation
	// Frontend handles tax as %, Backend expects tax as Amount
	const [taxRate, setTaxRate] = useState<number>(DEFAULT_TAX);
	const [isTaxIncluded, setIsTaxIncluded] = useState<boolean>(false);

	const {
		control,
		handleSubmit,
		reset,
		setFocus,
		setValue,
		getValues,
		watch, // Watch changes to update tax amount dynamically
		formState: { isSubmitting },
	} = useForm<ProductFormData>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			imageUrl: undefined,
			name: undefined,
			sellingPrice: undefined,
			buyingPrice: undefined,
			category: undefined,
			measureUnit: undefined,
			commission: undefined,
			description: undefined,
			stock: undefined,
			code: undefined,
			tax: undefined,
			productIngredients: [],
		},
	});

	// Populate form when product data is loaded
	useEffect(() => {
		if (productToEdit && categories && measureUnits) {
			const category = categories.find(
				(c) => c.code === productToEdit.categoryCode,
			);
			const measureUnit = measureUnits.find(
				(m) => m.code === productToEdit.measureUnitCode,
			);

			setValue("name", productToEdit.name);
			setValue("sellingPrice", productToEdit.sellingPrice);
			setValue("buyingPrice", productToEdit.buyingPrice);
			setValue("commission", productToEdit.commission);
			setValue("stock", productToEdit.stock);
			setValue("code", productToEdit.barcode || "");
			setValue("tax", productToEdit.tax);
			setValue("description", productToEdit.description);

			// Initialize taxRate state as percentage derived from amount
			if (productToEdit.sellingPrice > 0 && productToEdit.tax > 0) {
				const rate = (productToEdit.tax / productToEdit.sellingPrice) * 100;
				setTaxRate(rate);
			} else {
				setTaxRate(DEFAULT_TAX);
			}

			if (productToEdit.imageUrl) {
				setValue("imageUrl", productToEdit.imageUrl);
				setImageUri(productToEdit.imageUrl);
			}

			if (category) {
				setValue("category", { code: category.code, name: category.name });
			}
			if (measureUnit) {
				setValue("measureUnit", {
					code: measureUnit.code,
					name: measureUnit.name,
				});
			}

			if (productToEdit.ingredients) {
				const ingredients = productToEdit.ingredients.map((ing) => ({
					ingredientId: ing.ingredientId,
					name: ing.name || "",
					quantityNeeded: ing.quantityNeeded,
					unit: ing.measureUnitCode || "",
				}));
				setValue("productIngredients", ingredients);

			}

			// Sync ingredients to store
			// ingredients.forEach((ing) => {
			// 	useIngredientStore.getState().selectIngredient({
			// 		id: ing.ingredientId,
			// 		name: ing.name,
			// 		quantityNeeded: ing.quantityNeeded,
			// 		measureUnitName: ing.measureUnitCode,
			// 	} as any);
			// });
		}
	}, [productToEdit, categories, measureUnits, setValue, setImageUri]);

	// Sync variants to store
	useEffect(() => {
		if (isEditing && allVariants && id) {
			const productVariants = allVariants.filter(v => v.productId === id);
			const mappedVariants: VariantDraft[] = productVariants.map(v => ({
				id: v.id,
				name: v.name,
				isRequired: v.isRequired,
				isMultiple: v.isMultiple,
				options: v.options.map(opt => ({
					id: opt.id,
					name: opt.name,
					stock: opt.stock,
					priceAdjusment: opt.priceAdjusment,
                    ingredients: opt.ingredients?.map(ing => ({
                        ingredientId: ing.ingredientId,
                        name: ing.name,
                        quantityNeeded: ing.quantityNeeded,
                        measureUnit: ing.measureUnit
                    }))
				}))
			}));
			setVariants(mappedVariants);
		}
	}, [isEditing, allVariants, id, setVariants]);

	useEffect(() => {
		if (
			!isEditing &&
			categories &&
			categories.length > 0 &&
			!getValues("category")
		) {
			setValue("category", {
				code: categories[0].code,
				name: categories[0].name,
			});
		}
	}, [categories, setValue, getValues, isEditing]);

	useEffect(() => {
		if (
			!isEditing &&
			measureUnits &&
			measureUnits.length > 0 &&
			!getValues("measureUnit")
		) {
			setValue("measureUnit", {
				code: measureUnits[0].code,
				name: measureUnits[0].name,
			});
		}
	}, [measureUnits, setValue, getValues, isEditing]);

	// Watch selling price to update tax amount when price changes
	// (keeping percentage constant)
	const sellingPrice = watch("sellingPrice");

	useEffect(() => {
		// When selling price changes, or tax rate changes, recalculate the tax AMOUNT
		// Tax Amount = Selling Price * (Tax Rate / 100)
		if (sellingPrice && taxRate) {
			const price = Number(sellingPrice);
			const rate = Number(taxRate); // Handle potential formatting

			let taxAmount = 0;
			if (isTaxIncluded) {
				// Reverse calculation: Price = Base + Tax
				// Base = Price / (1 + Rate/100)
				// Tax = Price - Base
				const basePrice = price / (1 + rate / 100);
				taxAmount = price - basePrice;
			} else {
				// Standard: Tax = Base * Rate/100
				taxAmount = (price * rate) / 100;
			}

			// Avoid infinite loops or unnecessary updates if value is same
			// Use a small epsilon for float comparison or just check strict equality?
			// Checking inequality is fine for now
			if (Math.abs((getValues("tax") || 0) - taxAmount) > 0.001) {
				setValue("tax", taxAmount);
			}
		} else if (!taxRate) {
			// If rate is empty/0, tax amount should be 0
			if (getValues("tax") !== 0) {
				setValue("tax", 0);
			}
		}
	}, [sellingPrice, taxRate, isTaxIncluded, setValue, getValues]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		return () => {
			resetImageSelectionStore();
			resetCategoryStore();
			resetMeasureUnitStore();
			resetIngredientStore();
			resetVariantStore();
		};
	}, []);

	const processSubmit = async (
		data: ProductFormData,
		shouldGoBack: boolean,
	) => {
		try {
			let uploadedImageUrl = data.imageUrl;

			if (data.imageUrl && !data.imageUrl.startsWith("http")) {
				uploadedImageUrl = await uploadImage({
					fileUri: data.imageUrl,
					type: "product"
				});
			}

			const payload = {
				barcode: data.code || "",
				name: data.name,
				description: data.description || "",
				categoryCode: data.category.code,
				imageUrl: uploadedImageUrl || "",
				measureUnitCode: data.measureUnit.code,

				sellingPrice: isTaxIncluded && taxRate
					? data.sellingPrice / (1 + taxRate / 100)
					: data.sellingPrice,
				commission: data.commission || 0,
				discount: 0,
				tax: data.tax || 0,
				stock: data.stock || 0,
				buyingPrice: data.buyingPrice || 0,
				ingredients:
					data.productIngredients
						?.filter((ing) => !!ing)
						.map((ing) => ({
							ingredientId: ing!.ingredientId,
							quantityNeeded: ing!.quantityNeeded,
						})) || [],
			};

			let result;
			let currentProductId = id;

			if (isEditing && id) {
				result = await updateProduct({ id, data: payload });
				Alert.alert(t("success"), t("product_updated_success"));
			} else {
				result = await addProduct(payload);
				currentProductId = result.id;
				Alert.alert(t("success"), t("product_added_success"));
			}

			// Handle Variants
			if (currentProductId) {
				// 1. Delete removed variants
				if (deletedVariantIds.length > 0) {
					await Promise.all(deletedVariantIds.map(id => deleteVariant(id)));
				}

				// 2. Create or Update variants
                console.log("Saving variants. Count:", storeVariants.length);
				const variantPromises = storeVariants.map(async (variant) => {
					const variantPayload = {
						productId: currentProductId!, // Asserting non-null as we checked currentProductId
						name: variant.name,
						isRequired: variant.isRequired,
						isMultiple: variant.isMultiple,
						options: variant.options.map(opt => ({
							name: opt.name,
							stock: opt.stock,
							priceAdjusment: opt.priceAdjusment,
                            ingredients: opt.ingredients?.map(ing => ({
                                ingredientId: ing.ingredientId,
                                quantityNeeded: ing.quantityNeeded
                            })),
						}))
					};
                    
                    console.log("Processing variant:", variant.name, "isNew:", variant.isNew, "Payload:", JSON.stringify(variantPayload));

					if (variant.isNew) {
						return createVariant(variantPayload);
					} else {
						return updateVariant({ id: variant.id, data: variantPayload });
					}
				});

				await Promise.all(variantPromises);
			}

			if (shouldGoBack) {
				if (router.canGoBack()) {
					router.back();
				}
			} else {
				reset();
				resetVariantStore(); // Reset store for "Add More"
			}
		} catch (error: any) {
			Logger.error("Add/Update product failed:", error);
			Alert.alert(t("failed"), error.message);
		}
	};

	const onSave = (data: ProductFormData) => processSubmit(data, true);
	const onSaveAndAddMore = (data: ProductFormData) =>
		processSubmit(data, false);

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
			params: { title: t("product_image") },
		});
	};

	const handleSelectCategoryPress = (category: {
		code: string;
		name: string;
	}) => {
		setSaveCategoryCallback((selectedCategory) => {
			if (selectedCategory) {
				setValue("category", selectedCategory);
			}
		});

		router.push({
			pathname: "/modal/product/select-category",
			params: {
				...category,
			},
		});
	};

	const handleSelectMeasureUnitPress = (measureUnit: {
		code: string;
		name: string;
	}) => {
		setSaveMeasureUnitCallback((selectedMeasureUnit) => {
			if (selectedMeasureUnit) {
				setValue("measureUnit", selectedMeasureUnit);
			}
		});

		router.push({
			pathname: "/modal/product/select-measure-unit",
			params: {
				...measureUnit,
			},
		});
	};

	const handleSelectIngredientPress = () => {
		setSaveIngredientCallback((selectedIngredients) => {
			if (selectedIngredients) {
				const ingredients = selectedIngredients.map((ing) => ({
					ingredientId: ing.id,
					name: ing.name,
					quantityNeeded: ing.quantityNeeded || 0,
					unit: ing.measureUnitName,
				}));
				setValue("productIngredients", ingredients);
			}
		});

		// Pre-select existing ingredients
		const currentIngredients = getValues("productIngredients") || [];
		if (currentIngredients.length > 0) {
			const ingredientsForStore = currentIngredients
				.filter((i) => !!i)
				.map((i) => ({
					id: i!.ingredientId,
					name: i!.name || "",
					measureUnitName: i!.unit || (i as any).measureUnitCode || "", // Fallback just in case
					quantityNeeded: i!.quantityNeeded,
				}));

			useIngredientStore.getState().setSelectedIngredients(ingredientsForStore);
		} else {
			useIngredientStore.getState().setSelectedIngredients([]);
		}

		router.push("/modal/product/select-ingredient");
	};

	const handleRemoveIngredient = (ingredientId: string) => {
		const currentIngredients = getValues("productIngredients") || [];
		const updatedIngredients = currentIngredients.filter(
			(i) => i?.ingredientId !== ingredientId,
		);
		setValue("productIngredients", updatedIngredients);

		// Also remove from store to keep sync
		useIngredientStore.getState().selectIngredient({ id: ingredientId } as any);
	};

	const handleDelete = () => {
		Alert.alert(
			t("delete_product"),
			t("confirm_delete_product"),
			[
				{
					text: t("cancel"),
					style: "cancel",
				},
				{
					text: t("confirm"),
					style: "destructive",
					onPress: async () => {
						try {
							if (id) {
								await deleteProduct(id);
								if (router.canGoBack()) {
									router.back();
								}
							}
						} catch (error: any) {
							Logger.error("Hide product failed:", error);
							Alert.alert(t("failed"), error.message);
						}
					},
				},
			],
		);
	};

	const handleRestore = () => {
		Alert.alert(
			t("unhide_product"),
			t("confirm_unhide_product"),
			[
				{
					text: t("cancel"),
					style: "cancel",
				},
				{
					text: t("confirm"),
					onPress: async () => {
						try {
							if (id) {
								await restoreProduct(id);
								Alert.alert(t("success"), t("product_restored_success"));
								if (router.canGoBack()) {
									router.back();
								}
							}
						} catch (error: any) {
							Logger.error("Unhide product failed:", error);
							Alert.alert(t("failed"), error.message);
						}
					},
				},
			],
		);
	};

	const disableAction = isSubmitting;

	return (
		<View style={$.container}>
			<Stack.Screen
				options={{
					header: () => (
						<ScreenHeader
							rightAction={
								<View style={$.headerActions}>
									{isEditing ?
										<Button
											disabled={disableAction}
											isLoading={isSubmitting}
											onPress={productToEdit?.deletedAt ? handleRestore : handleDelete}
											size="md"
											title={productToEdit?.deletedAt ? t("unhide_product") : t("delete_product")}
											variant="secondary"
										/>
										: (
											<Button
												disabled={disableAction}
												isLoading={isSubmitting}
												onPress={handleSubmit(onSaveAndAddMore)}
												size="md"
												title={t("save_and_add_more")}
												variant="secondary"
											/>
										)}
									<Button
										disabled={disableAction}
										isLoading={isSubmitting}
										onPress={handleSubmit(onSave)}
										size="md"
										title={t("save")}
										variant="primary"
									/>
								</View>
							}
							title={isEditing ? t("edit_product") : t("add_product")}
						/>
					),
				}}
			/>

			<KeyboardForm contentContainerStyle={$.scrollContent} style={$.flex}>
				<View style={$.section}>
					<FormSectionCard
						required
						style={$.imageSection}
						title={t("product_image")}
					>
						<Controller
							control={control}
							name="imageUrl"
							render={({
								field: { onChange, value },
								fieldState: { error },
							}) => (
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
											{t("upload_image_or_select_color")}
										</Text>
										<Button
											disabled={disableAction}
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
					<FormSectionCard required title={t("product_category")}>
						<Controller
							control={control}
							name="category"
							render={({
								field: { onChange, value },
								fieldState: { error },
							}) => (
								<View style={$.categoryContainer}>
									{!!value && (
										<Text style={$.selectedCategoryText}>{value?.name}</Text>
									)}
									<Button
										onPress={() => handleSelectCategoryPress(value)}
										size="lg"
										title={value ? t("change_category") : t("select_category")}
										variant="soft"
									/>
								</View>
							)}
						/>
					</FormSectionCard>
					<FormSectionCard required title={t("measure_unit")}>
						<Controller
							control={control}
							name="measureUnit"
							render={({
								field: { onChange, value },
								fieldState: { error },
							}) => (
								<View style={$.categoryContainer}>
									{!!value && (
										<Text style={$.selectedCategoryText}>
											{value?.name} ({value?.code})
										</Text>
									)}
									<Button
										onPress={() => handleSelectMeasureUnitPress(value)}
										size="lg"
										title={value ? t("change_measure_unit") : t("select_measure_unit")}
										variant="soft"
									/>
								</View>
							)}
						/>
					</FormSectionCard>

					<FormSectionCard title={t("variants")}>
						<View style={$.categoryContainer}>
							{(storeVariants && storeVariants.length > 0) && (
								<Text style={$.selectedCategoryText}>
									{storeVariants.length} {storeVariants.length === 1 ? t("variant") : t("variants")} {t("configured")}
								</Text>
							)}
							<Button
								onPress={() => router.push("/modal/product/manage-variants")}
								size="lg"
								title={t("manage_variants")}
								variant="soft"
							/>
						</View>
					</FormSectionCard>

					{/* <View style={$.stockRow}>
						<View style={$.stockLabelBox}>
							<Text style={$.stockTitle}>
								Does this menu require stock management?
							</Text>
							<View style={$.stockDescRow}>
								<View style={$.infoIconBox}>
									<UniIcInfo />
								</View>
								<Text style={$.stockDescText}>
									When enabled, stock management is required before adding the
									menu item to orders. If the stock reaches 0, the menu item
									cannot be ordered.
								</Text>
							</View>
						</View>
						<Switch
							onValueChange={setIsStockManagementEnabled}
							value={isStockManagementEnabled}
						/>
					</View> */}
				</View>

				<View style={$.section}>
					<FormSectionCard required title={t("product_information")}>
						<Controller
							control={control}
							name="name"
							render={({
								field: { onChange, value },
								fieldState: { error },
							}) => (
								<Input
									defaultValue={value}
									disableFullscreenUI={true}
									editable={!disableAction}
									error={error?.message}
									label={t("product_name_required")}
									maxLength={100}
									onChangeText={onChange}
									onSubmitEditing={() => {
										setFocus("sellingPrice");
									}}
									returnKeyType="next"
									size="lg"
								/>
							)}
						/>
						<Controller
							control={control}
							name="description"
							render={({
								field: { onChange, ref, value },
								fieldState: { error },
							}) => (
								<Input
									editable={!disableAction}
									error={error?.message}
									label={t("description")}
									maxLength={500}
									onChangeText={onChange}
									ref={ref}
									returnKeyType="next"
									size="lg"
									value={value}
								/>
							)}
						/>
						<Controller
							control={control}
							name="buyingPrice"
							render={({
								field: { onChange, ref, value },
								fieldState: { error },
							}) => (
								<Input
									editable={!disableAction}
									error={error?.message}
									keyboardType="numeric"
									label={t("buying_price")}
									maxLength={15}
									onChangeText={(text: string) =>
										onChange(parseCurrency(text))
									}
									onSubmitEditing={() => {
										setFocus("sellingPrice");
									}}
									ref={ref}
									returnKeyType="next"
									size="lg"
									value={
										value !== undefined ? formatCurrency(value || 0) : ""
									}
								/>
							)}
						/>
						<Controller
							control={control}
							name="sellingPrice"
							render={({
								field: { onChange, ref, value },
								fieldState: { error },
							}) => (
								<Input
									editable={!disableAction}
									error={error?.message}
									keyboardType="numeric"
									label={t("selling_price_required")}
									maxLength={15}
									onChangeText={(text: string) => onChange(parseCurrency(text))}
									onSubmitEditing={() => {
										setFocus("commission");
									}}
									ref={ref}
									returnKeyType="next"
									size="lg"
									value={value !== undefined ? formatCurrency(value) : ""}
								/>

							)}
						/>

						<View style={$.taxToggleRow}>
							<Text style={$.taxToggleLabel}>{t("price_includes_tax")}</Text>
							<Switch
								onValueChange={setIsTaxIncluded}
								value={isTaxIncluded}
							/>
						</View>

						<View style={$.commissionRow}>
							<View style={$.flex}>
								<Controller
									control={control}
									name="commission"
									render={({
										field: { onChange, ref, value },
										fieldState: { error },
									}) => (
										<Input
											editable={!disableAction}
											error={error?.message}
											keyboardType="numeric"
											label={t("commission")}
											maxLength={15}
											onChangeText={(text: string) =>
												onChange(parseCurrency(text))
											}
											onSubmitEditing={() => {
												setFocus("code");
											}}
											ref={ref}
											returnKeyType="next"
											size="lg"
											value={
												value !== undefined
													? formatCurrency(value || 0)
													: ""
											}
										/>
									)}
								/>
							</View>
						</View>
						<Controller
							control={control}
							name="code"
							render={({
								field: { onChange, ref, value },
								fieldState: { error },
							}) => (
								<Input
									defaultValue={value}
									editable={!disableAction}
									error={error?.message}
									label={t("product_code")}
									maxLength={50}
									onChangeText={onChange}
									onSubmitEditing={() => {
										setFocus("tax");
									}}
									ref={ref}
									returnKeyType="next"
									size="lg"
								/>
							)}
						/>
						<Controller
							control={control}
							name="tax"
							render={({
								field: { ref },
								fieldState: { error },
							}) => (
								<Input
									editable={!disableAction}
									error={error?.message}
									keyboardType="numeric"
									label={`${t("tax")} (%)`}
									// maxLength={5}
									maxValue={30}
									minValue={0}
									// Input controls the RATE (%), not the amount directly
									onChangeText={(text: string) => setTaxRate(parseNumber(text))}
									ref={ref}
									returnKeyType="done"
									size="lg"
									// Display the rate string directly
									value={taxRate.toFixed(0).toString()}
									right={<Text style={{ paddingRight: 12, color: '#6B7280' }}>%</Text>}
								/>
							)}
						/>
					</FormSectionCard>

					{/* {isStockManagementEnabled && (
						<FormSectionCard title={t("stock_management")}>
							<Controller
								control={control}
								name="stock"
								render={({
									field: { onChange, ref, value },
									fieldState: { error },
								}) => (
									<Input
										editable={!disableAction}
										error={error?.message}
										keyboardType="numeric"
										label={t("initial_stock_required")}
										maxLength={10}
										onChangeText={(text: string) =>
											onChange(parseNumber(text))
										}
										ref={ref}
										returnKeyType="done"
										size="lg"
										value={
											value !== undefined ? formatNumber(value || 0) : ""
										}
									/>
								)}
							/>
						</FormSectionCard>
					)} */}

					{/* <FormSectionCard title="Product Variant">
						<Button size="lg" title="Add New Variant" variant="soft" />
						<Button size="lg" title="Choose Existing Variant" variant="soft" />
					</FormSectionCard> */}

					<FormSectionCard title={t("product_ingredient")}>
						<Controller
							control={control}
							name="productIngredients"
							render={({
								field: { onChange, ref, value },
								fieldState: { error },
							}) => (
								<>
									{value && value.length > 0 && (
										<View style={$.ingredientListContainer}>
											{value
												.filter((item) => !!item)
												.map((item) => (
													<View
														key={item.ingredientId}
														style={$.ingredientCard}
													>
														<Text style={$.ingredientName}>{item.name}</Text>
														<View style={$.ingredientRight}>
															<Text style={$.ingredientQty}>
																{item.quantityNeeded}{" "}
																{item.unit}
															</Text>
															<IconButton
																Icon={IcX}
																onPress={() =>
																	handleRemoveIngredient(item.ingredientId)
																}
																size="sm"
																variant="neutral"
															/>
														</View>
													</View>
												))}
										</View>
									)}
									<Button
										onPress={handleSelectIngredientPress}
										size="lg"
										title={t("add_ingredient")}
										variant="soft"
									/>
								</>
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
	headerActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.lg,
	},
	scrollContent: {
		paddingVertical: theme.spacing.xxl,
		paddingHorizontal: vs(193),
		flexDirection: "row",
		flexGrow: 1,
		gap: theme.spacing.xxl,
	},
	section: {
		flex: 1,
		gap: theme.spacing.xxl,
	},
	imageSection: {
		gap: theme.spacing.lg,
	},
	imagePlaceholder: {
		aspectRatio: 402 / 220,
		backgroundColor: theme.colors.neutral[300],
		borderWidth: 1,
		borderColor: theme.colors.neutral[400],
		borderRadius: theme.radius.sm,
		justifyContent: "center",
		alignItems: "center",
	},
	image: {
		aspectRatio: 16 / 9,
		borderWidth: 1,
		borderColor: theme.colors.neutral[400],
		borderRadius: theme.radius.sm,
	},
	uploadRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: theme.spacing.xs,
	},
	uploadText: {
		...theme.typography.labelMd,
		color: theme.colors.neutral[600],
	},
	stockRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		gap: theme.spacing.md,
	},
	stockLabelBox: {
		gap: theme.spacing.md,
		flexShrink: 1,
	},
	stockTitle: {
		...theme.typography.heading4,
		color: theme.colors.neutral[700],
		flexShrink: 1,
	},
	stockDescRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: theme.spacing.sm,
		flexShrink: 1,
	},
	infoIconBox: {
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: vs(2),
	},
	stockDescText: {
		...theme.typography.labelMd,
		color: theme.colors.neutral[600],
	},
	commissionRow: {
		flexDirection: "row",
		gap: theme.spacing.lg,
	},
	taxToggleRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: theme.spacing.sm,
	},
	taxToggleLabel: {
		...theme.typography.labelMd,
		color: theme.colors.neutral[700],
	},
	flex: {
		flex: 1,
	},
	categoryContainer: {
		gap: theme.spacing.md,
	},
	selectedCategoryText: {
		...theme.typography.labelLg,
		color: theme.colors.neutral[700],
	},
	ingredientListContainer: {
		gap: theme.spacing.xs,
		marginBottom: theme.spacing.lg,
	},
	ingredientCard: {
		backgroundColor: theme.colors.neutral[100],
		padding: theme.spacing.sm,
		borderRadius: theme.radius.xs,
		borderWidth: 1,
		borderColor: theme.colors.neutral[300],
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	ingredientName: {
		...theme.typography.labelMd,
		color: theme.colors.neutral[700],
	},
	ingredientRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.md,
	},
	ingredientQty: {
		...theme.typography.labelSm,
		color: theme.colors.neutral[600],
	},
}));

export default AddProduct;
