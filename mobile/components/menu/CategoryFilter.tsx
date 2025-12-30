import { FlashList as ShopifyFlashList, type FlashListProps } from "@shopify/flash-list";
import React from "react";

// Workaround for missing estimatedItemSize in FlashList props type definition
const FlashList = ShopifyFlashList as unknown as <T>(
	props: FlashListProps<T> & { estimatedItemSize: number }
) => React.ReactElement;
import { memo, useMemo } from "react";
import { View, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useShallow } from "zustand/react/shallow";
import Button from "@/components/ui/Button";
import { type ProductCategory } from "@/services/types/ProductCategory";
import { useProductCategoriesQuery } from "@/services/queries/useProductCategoriesQuery";
import { useCategoryStore } from "@/store/useMenuCategoryStore";
import { t } from '@/services/i18n';
import IcX from "@/assets/icons/x.svg";
import { Alert, TouchableOpacity } from "react-native";
import { vs } from "@/utils/Scale";
import { useDeleteCategoryMutation } from "@/services/mutations/useDeleteCategoryMutation";

interface CategoryFilterProps {
	style?: ViewStyle;
	editable?: boolean;
}

const CategoryFilter = ({ style, editable }: CategoryFilterProps) => {
	const { data } = useProductCategoriesQuery();
	const searchQuery = useCategoryStore((s) => s.searchQuery);

	const dataWithAll = useMemo(() => {
		// Fixed "All" category
		const allCategory: ProductCategory = {
			code: "ALL",
			name: t("all"),
			description: "",
			storeId: "",
			createdBy: "",
			updatedBy: "",
			createdAt: "",
			updatedAt: "",
			deletedAt: null,
		};
		return [allCategory, ...(data || [])];
	}, [data]);

	if (searchQuery.length >= 2) return null;

	return (
		<Animated.View style={[$.container, style]}>
			<FlashList
				contentContainerStyle={$.content}
				data={dataWithAll}
				horizontal
				ItemSeparatorComponent={() => <View style={$.separator} />}
				keyExtractor={(item) => item.code}
				estimatedItemSize={50}
				renderItem={({ item }) => (
					<CategoryItem editable={editable} item={item} />
				)}
			/>
		</Animated.View>
	);
};

interface CategoryItemProps {
	item: ProductCategory;
	editable?: boolean;
}

const CategoryItem = memo(({ item, editable }: CategoryItemProps) => {
	const { theme } = useUnistyles();
	const { mutate: deleteCategory } = useDeleteCategoryMutation();

	const handleDelete = () => {
		Alert.alert(
			"Delete Category",
			`Are you sure you want to delete ${item.name}?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: () => deleteCategory(item.code),
				},
			],
		);
	};

	const { active, setSelectedCategory } = useCategoryStore(
		useShallow((state) => ({
			setSelectedCategory: state.setSelectedCategory,
			active: state.selectedCategory === item.code,
		})),
	);

	return (
		<Button
			onPress={() => setSelectedCategory(item.code)}
			size="md"
			title={item.name}
			variant={active ? "soft" : "neutral"}
			right={
				editable &&
				item.code !== "ALL" && (
					<TouchableOpacity
						onPress={handleDelete}
						style={{ marginLeft: theme.spacing.md }}
					>
						<IcX
							color={theme.colors.neutral[500]}
							height={vs(20)}
							width={vs(20)}
						/>
					</TouchableOpacity>
				)
			}
		/>
	);
});

CategoryItem.displayName = "CategoryItem";

const $ = StyleSheet.create((theme) => ({
	container: {
		marginHorizontal: theme.spacing.xl,
		marginBottom: theme.spacing.xxl,
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 10,
	},
	content: {
		paddingTop: theme.spacing.xs,
	},
	separator: {
		marginRight: theme.spacing.md,
	},
}));

export default CategoryFilter;
