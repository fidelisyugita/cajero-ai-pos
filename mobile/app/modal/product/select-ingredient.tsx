import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { memo, useState } from "react";
import { t } from "@/services/i18n";
import { Alert, Text, View, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcPlus from "@/assets/icons/plus.svg";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import ScreenModal from "@/components/ui/ScreenModal";
import EmptyState from "@/components/ui/EmptyState";
import { useIngredientStore } from "@/store/useIngredientStore";
import { useStoreShallow } from "@/hooks/useStoreShallow";
import { type Ingredient } from "@/services/types/Ingredient";
import { useIngredientsQuery } from "@/services/queries/useIngredientsQuery";
import { useCreateIngredientMutation } from "@/services/mutations/useCreateIngredientMutation";
import { useAuthStore } from "@/store/useAuthStore";
import { s, vs } from "@/utils/Scale";
import Select from "@/components/ui/Select";
import { useMeasureUnitsQuery } from "@/services/queries/useMeasureUnitsQuery";
import Logger from "@/services/logger";

interface IngredientItemProps {
	item: Ingredient;
}

const SelectIngredientModal = () => {
	const router = useRouter();

	return (
		<ScreenModal modalStyle={$.modal}>
			<ScreenModal.Header title={t("select_ingredient")} />
			<ScreenModal.Body>
				<View style={$.container}>
					<AddIngredient />
					<IngredientList />
				</View>
			</ScreenModal.Body>
			<ScreenModal.Footer>
				<Button
					onPress={() => {
						router.dismiss();
					}}
					size="md"
					style={$.flex}
					title={t("cancel")}
					variant="secondary"
				/>
				<Button
					onPress={() => {
						useIngredientStore.getState().saveIngredient();
						router.dismiss();
					}}
					size="md"
					style={$.flex}
					title={t("save")}
					variant="primary"
				/>
			</ScreenModal.Footer>
		</ScreenModal>
	);
};

const AddIngredient = () => {
	const storeId = useAuthStore((s) => s.user?.storeId);

	const { mutateAsync: addIngredient, isPending } = useCreateIngredientMutation();
	const { data: measureUnits } = useMeasureUnitsQuery();

	const [ingredientName, setIngredientName] = useState("");
	const [measureUnitCode, setMeasureUnitCode] = useState("PCS");

	const handleAddIngredient = async () => {
		// If storeId is not available, we can't add an ingredient
		if (!storeId) {
			Logger.error("Store ID is not available");
			Alert.alert("Error", "Store ID is not available");
			return;
		}

		try {
			const result = await addIngredient({
				name: ingredientName,
				description: "",
				stock: 0,
				measureUnitCode: measureUnitCode || "PCS",
			});
			Alert.alert("Success", `Ingredient ${result.name} added successfully`);
			setIngredientName(""); // Reset name after success
		} catch (error: any) {
			Logger.error("Failed to add ingredient:", error);
			Alert.alert("Add Ingredient Failed", error.message);
		}
	};

	return (
		<View style={$.addIngredientContainer}>
			<Text style={$.addIngredientTitle}>{t("add_ingredient")}</Text>

			<View style={$.addIngredientRow}>
				<Input
					autoCapitalize="none"
					containerStyle={$.addIngredientInput}
					defaultValue={ingredientName}
					editable={!isPending}
					label={t("ingredient_name")}
					maxLength={60}
					onChangeText={setIngredientName}
					size="lg"
				/>
				<Select
					containerStyle={$.selectContainer}
					options={
						measureUnits?.map((mu) => ({
							label: mu.code,
							value: mu.code,
						})) || []
					}
					placeholder={t("unit")}
					value={measureUnitCode}
					onSelect={setMeasureUnitCode}
					disabled={isPending}
				/>
				<IconButton
					disabled={isPending}
					Icon={IcPlus}
					onPress={handleAddIngredient}
					size="lg"
					variant="primary"
				/>
			</View>
		</View>
	);
};

const IngredientList = () => {
	const { data: ingredients } = useIngredientsQuery();
	return (
		<FlashList
			data={ingredients}
			ItemSeparatorComponent={() => <View style={$.listSeparator} />}
			keyExtractor={(item) => item.id}
			ListHeaderComponent={
				<Text style={$.listTitle}>{t("list_of_ingredient")}</Text>
			}
			ListHeaderComponentStyle={$.listHeader}
			renderItem={({ item }) => <IngredientItem item={item} />}
			ListEmptyComponent={
				<EmptyState
					title={t("empty_ingredients_title")}
					subtitle={t("empty_ingredients_subtitle")}
				/>
			}
		/>
	);
};

const IngredientItem = memo(({ item }: IngredientItemProps) => {
	const { selectIngredient, checked, quantityNeeded, updateQuantity } =
		useStoreShallow(useIngredientStore, (s) => {
			const selectedItem = s.selectedIngredient?.find((i) => i.id === item.id);
			return {
				selectIngredient: s.selectIngredient,
				checked: !!selectedItem,
				quantityNeeded: selectedItem?.quantityNeeded?.toString() || "",
				updateQuantity: s.updateQuantity,
			};
		});

	const onCheck = () => {
		selectIngredient({
			id: item.id,
			name: item.name,
			measureUnitName: item.measureUnitCode,
		});
	};

	const onChangeQuantity = (text: string) => {
		// allow empty string for typing
		if (text === "") {
			updateQuantity(item.id, 0); // or keep it empty logic if store allows
			return;
		}
		const qty = parseFloat(text);
		if (!isNaN(qty)) {
			updateQuantity(item.id, qty);
		}
	};

	return (
		<View style={$.ingredientItemWrapper}>
			<TouchableOpacity onPress={onCheck} style={$.ingredientItemContainer}>
				<Checkbox checked={checked} onPress={onCheck} />
				<Text style={$.ingredientName}>{item.name}</Text>
				{checked && (
					<View style={$.quantityContainer}>
						<Input
							value={quantityNeeded}
							onChangeText={onChangeQuantity}
							placeholder={t("qty")}
							keyboardType="numeric"
							size="sm"
							containerStyle={$.quantityInput}
							selectTextOnFocus
							right={<Text style={$.measureUnitLabel}>{item.measureUnitCode}</Text>}
						/>
					</View>
				)}
			</TouchableOpacity>
		</View>
	);
});
IngredientItem.displayName = "IngredientItem";

const $ = StyleSheet.create((theme) => ({
	modal: {
		aspectRatio: 649 / 874,
		width: vs(649),
	},
	container: {
		padding: theme.spacing.xl,
		gap: theme.spacing.xxl,
		flex: 1,
	},

	// List styles
	listHeader: {
		marginBottom: vs(20),
	},
	listTitle: {
		...theme.typography.heading4,
		color: theme.colors.neutral[700],
	},
	listSeparator: {
		marginBottom: theme.spacing.sm,
	},

	// Ingredient item styles
	ingredientItemWrapper: {
		gap: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
	},
	ingredientItemContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.lg,
	},
	ingredientName: {
		...theme.typography.bodyLg,
		color: theme.colors.neutral[700],
		flex: 1,
		// width: vs(200),
	},
	measureUnitText: {
		...theme.typography.bodyMd,
		color: theme.colors.neutral[500],
	},
	quantityContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.md,
		paddingLeft: vs(34), // Indent to align with text
	},
	quantityInput: {
		width: vs(150),
	},
	measureUnitLabel: {
		...theme.typography.bodyMd,
		color: theme.colors.neutral[600],
	},

	// Add ingredient styles
	addIngredientContainer: {
		gap: vs(20),
	},
	addIngredientTitle: {
		...theme.typography.heading4,
		color: theme.colors.neutral[700],
	},
	addIngredientRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: vs(20),
	},
	addIngredientInput: {
		flex: 3,
	},
	selectContainer: {
		flex: 1,
	},

	// Utility styles
	flex: {
		flex: 1,
	},
	scrollContent: {
		padding: theme.spacing.xl,
		gap: vs(20),
		flexGrow: 1,
	},
}));

export default SelectIngredientModal;
