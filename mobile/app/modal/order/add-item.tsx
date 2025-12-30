import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { t } from "@/services/i18n";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcMinus from "@/assets/icons/minus.svg";
import IcPlus from "@/assets/icons/plus.svg";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import RadioButton from "@/components/ui/RadioButton";
import ScreenModal from "@/components/ui/ScreenModal";
import { formatCurrency } from "@/utils/Format";
import { vs } from "@/utils/Scale";
import { useOrderStore } from "@/store/useOrderStore";
import { useVariantsQuery } from "@/services/queries/useVariantsQuery";
import { useBusinessStore } from "@/store/useBusinessStore";

const AddItemModal = () => {
	const router = useRouter();
	const params = useLocalSearchParams();
	const orderItemId = params.orderItemId as string | undefined;

	const product = {
		id: params.id as string,
		name: params.name as string,
		price: Number(params.sellingPrice),
		imageUrl: params.imageUrl as string,
		tax: Number(params.tax) || 0,
		commission: Number(params.commission) || 0,
	};

	const { data: allVariants, isLoading } = useVariantsQuery();

	const productVariants = useMemo(() => {
		if (!allVariants) return [];
		return allVariants.filter((v) => v.productId === product.id);
	}, [allVariants, product.id]);

	const [quantity, setQuantity] = useState(
		params.initialQuantity ? Number(params.initialQuantity) : 1,
	);

	const business = useBusinessStore((state) => state.business);
	const maxDiscountPercent = business?.maxDiscount ?? 10;

	const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>(
		params.initialVariants ? JSON.parse(params.initialVariants as string) : {},
	);
	const [note, setNote] = useState((params.initialNote as string) || "");
	const [discount, setDiscount] = useState(
		params.initialDiscount ? String(params.initialDiscount) : "",
	);

	const handleQuantityChange = (delta: number) => {
		setQuantity((prev) => Math.max(1, prev + delta));
	};

	const handleVariantChange = (
		variantId: string,
		optionId: string,
		isMultiple: boolean,
	) => {
		if (!isMultiple) {
			// Radio logic: single selection per variant group
			setSelectedVariants((prev) => ({ ...prev, [variantId]: optionId }));
		} else {
			// Checkbox logic: multiple selection
			setSelectedVariants((prev) => {
				const current = prev[variantId] || [];
				if (current.includes(optionId)) {
					return {
						...prev,
						[variantId]: current.filter((id: string) => id !== optionId),
					};
				}
				// Note: Max limit logic removed as it's not supported by backend yet
				return { ...prev, [variantId]: [...current, optionId] };
			});
		}
	};

	const addItem = useOrderStore((state) => state.addItem);
	const updateItem = useOrderStore((state) => state.updateItem);

	const handleAdd = () => {
		const variants: any[] = [];

		productVariants.forEach((variant) => {
			const selection = selectedVariants[variant.id];
			if (!selection) return;

			const processOption = (optId: string) => {
				const opt = variant.options.find((o) => o.id === optId);
				if (opt) {
					variants.push({
						groupId: variant.id,
						optionId: opt.id,
						name: opt.name,
						price: opt.priceAdjusment, // backend typo: priceAdjusment
					});
				}
			};

			if (Array.isArray(selection)) {
				selection.forEach(processOption);
			} else {
				processOption(selection);
			}
		});

		const totalVariantPrice = variants.reduce((sum, v) => sum + v.price, 0);
		const unitPrice = product.price + totalVariantPrice;
		const totalPrice = unitPrice * quantity;
		const discountAmount = Number(discount) || 0;
		const maxAmount = totalPrice * (maxDiscountPercent / 100);

		if (discountAmount > maxAmount) {
			Alert.alert(
				t("error"),
				t("discount_exceeds_price"),
			);
			return;
		}

		const orderItemData = {
			productId: product.id,
			name: product.name,
			sellingPrice: product.price,
			imageUrl: product.imageUrl,
			quantity: quantity,
			variants: variants,
			note: note,
			discount: Number(discount) || 0,
			tax: product.tax,
			commission: product.commission,
		};

		if (orderItemId) {
			updateItem({ ...orderItemData, id: orderItemId });
		} else {
			addItem(orderItemData);
		}

		router.dismiss();
	};

	return (
		<ScreenModal modalStyle={$.modal}>
			<ScreenModal.Header title={orderItemId ? t("edit_item") : t("add_item")} />
			<ScreenModal.Body>
				<View style={$.container}>
					<ScrollView
						contentContainerStyle={$.scrollContent}
						showsVerticalScrollIndicator={false}
					>
						{/* Product Header */}
						<View style={$.productHeader}>
							<Image
								source={product.imageUrl}
								style={$.productImage}
								contentFit="cover"
							/>
							<View style={$.productInfo}>
								<Text style={$.productName}>{product.name}</Text>
								<View style={$.priceRow}>
									<Text style={$.priceLabel}>{t("basic_price")}</Text>
									<Text style={$.priceValue}>
										{formatCurrency(product.price)}
									</Text>
								</View>
							</View>
						</View>

						{/* Quantity */}
						<View style={$.quantityContainer}>
							<View style={$.quantityControls}>
								<IconButton
									Icon={IcMinus}
									variant="neutral"
									size="md"
									onPress={() => handleQuantityChange(-1)}
									disabled={quantity <= 1}
								/>
								<View style={$.quantityDisplay}>
									<Text style={$.quantityText}>{quantity}</Text>
								</View>
								<IconButton
									Icon={IcPlus}
									variant="neutral"
									size="md"
									onPress={() => handleQuantityChange(1)}
								/>
							</View>
						</View>

						<Text style={$.sectionTitle}>{t("variant")}</Text>

						{isLoading ? (
							<ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
						) : (
							/* Variants List */
							productVariants.map((variant) => (
								<View key={variant.id} style={$.variantGroup}>
									<Text style={$.variantGroupTitle}>
										{variant.name}
										{variant.isRequired && " *"}
										{/* Max limit text removed as not supported by backend schema */}
									</Text>
									<View style={$.optionsList}>
										{variant.options.map((option) => {
											const isSelected = !variant.isMultiple
												? selectedVariants[variant.id] === option.id
												: selectedVariants[variant.id]?.includes(option.id);

											return (
												<TouchableOpacity
													key={option.id}
													style={$.optionRow}
													activeOpacity={0.7}
													onPress={() =>
														handleVariantChange(variant.id, option.id, variant.isMultiple)
													}
												>
													<View style={$.optionLeft}>
														{!variant.isMultiple ? (
															<RadioButton
																checked={isSelected}
																onPress={() =>
																	handleVariantChange(
																		variant.id,
																		option.id,
																		variant.isMultiple,
																	)
																}
															/>
														) : (
															<Checkbox
																checked={isSelected}
																onPress={() =>
																	handleVariantChange(
																		variant.id,
																		option.id,
																		variant.isMultiple,
																	)
																}
															/>
														)}
														<Text style={$.optionName}>{option.name}</Text>
													</View>
													<Text style={$.optionPrice}>
														{option.priceAdjusment === 0
															? "Rp 0"
															: formatCurrency(option.priceAdjusment)}
													</Text>
												</TouchableOpacity>
											);
										})}
									</View>
								</View>
							))
						)}

						{/* Discount & Note */}
						<View style={$.inputGroup}>
							<Input
								label="Discount"
								size="lg"
								value={discount}
								onChangeText={(text) => {
									let totalVariantPrice = 0;

									productVariants.forEach((variant) => {
										const selection = selectedVariants[variant.id];
										if (!selection) return;
										const processOption = (optId: string) => {
											const opt = variant.options.find((o) => o.id === optId);
											if (opt) totalVariantPrice += opt.priceAdjusment;
										};
										if (Array.isArray(selection)) selection.forEach(processOption);
										else processOption(selection);
									});

									const maxPrice = (product.price + totalVariantPrice) * quantity;
									const maxAllowedDiscount = maxPrice * (maxDiscountPercent / 100);

									const numericValue = Number(text);
									if (text === "" || (numericValue >= 0 && numericValue <= maxAllowedDiscount)) {
										setDiscount(text);
									}
								}}
								placeholder="Discount"
								keyboardType="numeric"
							/>
							<Input
								label="Note (Optional)"
								size="lg"
								value={note}
								onChangeText={setNote}
								placeholder="Note (Optional)"
							/>
						</View>
					</ScrollView>
				</View>
			</ScreenModal.Body>
			<ScreenModal.Footer>
				<Button
					title={orderItemId ? t("update_order") : t("add_to_order_list")}
					size="lg"
					variant="primary"
					leftIcon={() => <View />}
					style={$.addButton}
					onPress={handleAdd}
				/>
			</ScreenModal.Footer>
		</ScreenModal>
	);
};

const $ = StyleSheet.create((theme) => ({
	modal: {
		width: vs(600),
		height: "90%",
		maxHeight: vs(900),
	},
	container: {
		flex: 1,
		backgroundColor: theme.colors.neutral[100],
	},
	scrollContent: {
		padding: theme.spacing.xl,
		gap: theme.spacing.xl,
		paddingBottom: vs(100),
	},
	productHeader: {
		flexDirection: "row",
		gap: theme.spacing.lg,
	},
	productImage: {
		width: vs(180),
		height: vs(120),
		borderRadius: theme.radius.md,
		backgroundColor: theme.colors.neutral[200],
	},
	productInfo: {
		flex: 1,
		justifyContent: "center",
		gap: theme.spacing.sm,
	},
	productName: {
		...theme.typography.heading3,
		color: theme.colors.neutral[700],
	},
	priceRow: {
		gap: theme.spacing.xs,
	},
	priceLabel: {
		...theme.typography.bodyMd,
		color: theme.colors.neutral[500],
	},
	priceValue: {
		...theme.typography.heading4,
		color: theme.colors.primary[500],
	},
	quantityContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.lg,
	},
	quantityControls: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.md,
	},
	quantityDisplay: {
		width: vs(50),
		alignItems: "center",
		justifyContent: "center",
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.neutral[400],
		paddingVertical: theme.spacing.xs,
	},
	quantityText: {
		...theme.typography.heading5,
		color: theme.colors.neutral[700],
	},
	sectionTitle: {
		...theme.typography.bodyMd,
		color: theme.colors.neutral[500],
		marginTop: theme.spacing.md,
	},
	variantGroup: {
		gap: theme.spacing.md,
	},
	variantGroupTitle: {
		...theme.typography.heading5,
		color: theme.colors.neutral[700],
	},
	optionsList: {
		gap: theme.spacing.md,
	},
	optionRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	optionLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.md,
	},
	optionName: {
		...theme.typography.bodyLg,
		color: theme.colors.neutral[700],
	},
	optionPrice: {
		...theme.typography.bodyMd,
		color: theme.colors.primary[500],
	},
	inputGroup: {
		gap: theme.spacing.lg,
		marginTop: theme.spacing.lg,
	},
	addButton: {
		flex: 1,
	},
}));

export default AddItemModal;
