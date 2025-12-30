import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { memo, useEffect } from "react";
import { t } from "@/services/i18n";
import { Text, View, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useShallow } from "zustand/react/shallow";
import IcPlus from "@/assets/icons/plus.svg";
import IcX from "@/assets/icons/x.svg";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import RadioButton from "@/components/ui/RadioButton";
import Input from "@/components/ui/Input";
import ScreenModal from "@/components/ui/ScreenModal";
import { useCategoryStore } from "@/store/useProductCategoryStore";
import { type ProductCategory } from "@/services/types/ProductCategory";
import { useProductCategoriesQuery } from "@/services/queries/useProductCategoriesQuery";
import { vs } from "@/utils/Scale";
import { useCreateProductCategoryMutation } from "@/services/mutations/useCreateProductCategoryMutation";
import Logger from "@/services/logger";

interface CategoryItemProps {
	item: ProductCategory;
}

const SelectCategoryModal = () => {
	const router = useRouter();
	const { code, name } = useLocalSearchParams() as {
		code: string;
		name: string;
	};

	const { hasSelected, saveCategory, reset } = useCategoryStore(
		useShallow((s) => ({
			hasSelected: !!s.selectedCategory,
			saveCategory: s.saveCategory,
			reset: s.reset,
		})),
	);

	useEffect(() => {
		if (code && name) {
			useCategoryStore.setState((p) => ({
				selectedCategory: p.selectedCategory ?? {
					code,
					name,
				},
			}));
		}
	}, [code, name]);

	return (
		<ScreenModal modalStyle={$.modal}>
			<ScreenModal.Header title={t("select_category")} />
			<ScreenModal.Body>
				<View style={$.container}>
					<AddCategory />
					<CategoryList />
				</View>
			</ScreenModal.Body>
			<ScreenModal.Footer>
				<Button
					onPress={() => {
						reset();
						router.dismiss();
					}}
					size="md"
					style={$.flex}
					title={t("cancel")}
					variant="secondary"
				/>
				<Button
					disabled={!hasSelected}
					onPress={() => {
						saveCategory();
						router.dismiss();
					}}
					size="md"
					style={$.flex}
					title={t("select")}
					variant="primary"
				/>
			</ScreenModal.Footer>
		</ScreenModal>
	);
};

const AddCategory = () => {
	const { newCategoryName, setNewCategoryName } = useCategoryStore();
	const { mutate: createCategory, isPending } = useCreateProductCategoryMutation();

	const handleAddCategory = () => {
		if (!newCategoryName) return;

		createCategory(
			{ name: newCategoryName, code: newCategoryName.toUpperCase().replace(" ", "_") },
			{
				onSuccess: () => {
					setNewCategoryName("");
				},
				onError: (error) => {
					alert(t("failed_to_add_category"));
					Logger.error("Add category error:", error);
				},
			},
		);
	};

	return (
		<View style={$.addCategoryContainer}>
			<Text style={$.addCategoryTitle}>{t("add_category")}</Text>
			<View style={$.addCategoryRow}>
				<Input
					containerStyle={$.addCategoryInput}
					defaultValue={newCategoryName}
					label={t("category_name")}
					maxLength={60}
					onChangeText={setNewCategoryName}
					size="lg"
				/>
				<IconButton
					disabled={!newCategoryName || isPending}
					Icon={IcPlus}
					onPress={handleAddCategory}
					size="lg"
					variant="primary"
				/>
			</View>
		</View>
	);
};

const CategoryList = () => {
	const { data: categories } = useProductCategoriesQuery();

	return (
		<View style={$.flex}>
			<FlashList
				data={categories}
				ItemSeparatorComponent={() => <View style={$.listSeparator} />}
				keyExtractor={(item) => item.code}
				ListHeaderComponent={
					<Text style={$.listTitle}>{t("list_of_category")}</Text>
				}
				ListHeaderComponentStyle={$.listHeader}
				renderItem={({ item }) => <CategoryItem item={item} />}
			/>
		</View>
	);
};

const CategoryItem = memo(({ item }: CategoryItemProps) => {
	const checked = useCategoryStore(
		(s) => s.selectedCategory?.code === item.code,
	);

	const onCheck = () => {
		useCategoryStore.setState({
			selectedCategory: {
				name: item.name,
				code: item.code,
			},
		});
	};

	return (
		<View style={$.categoryItemContainer}>
			<TouchableOpacity onPress={onCheck} style={$.categoryItemRow}>
				<RadioButton checked={checked} onPress={onCheck} />
				<Text style={$.categoryItemText}>{item.name}</Text>
			</TouchableOpacity>
			<IconButton Icon={IcX} size="md" variant="neutral-no-stroke" />
		</View>
	);
});
CategoryItem.displayName = "CategoryItem";

const $ = StyleSheet.create((theme) => ({
	modal: {
		aspectRatio: 649 / 874,
		width: vs(649),
	},
	flex: {
		flex: 1,
	},
	container: {
		padding: theme.spacing.xl,
		gap: theme.spacing.xxl,
		flex: 1,
	},
	addCategoryContainer: {
		gap: vs(20),
	},
	addCategoryTitle: {
		...theme.typography.heading4,
		color: theme.colors.neutral[700],
	},
	addCategoryRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: vs(20),
	},
	addCategoryInput: {
		flex: 1,
	},
	listTitle: {
		...theme.typography.heading4,
		color: theme.colors.neutral[700],
	},
	categoryItemContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: vs(20),
	},
	categoryItemRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.lg,
		flex: 1,
	},
	categoryItemText: {
		...theme.typography.bodyLg,
		color: theme.colors.neutral[700],
	},
	listSeparator: {
		marginBottom: theme.spacing.sm,
	},
	listHeader: {
		marginBottom: vs(20),
	},
}));

export default SelectCategoryModal;
