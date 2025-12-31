import { AnimatedFlashList as ShopifyAnimatedFlashList, FlashList, type FlashListProps } from "@shopify/flash-list";
import React from "react";

// Workaround for missing estimatedItemSize in FlashList props type definition
const AnimatedFlashList = ShopifyAnimatedFlashList as unknown as <T>(
	props: FlashListProps<T> & { estimatedItemSize: number } & React.RefAttributes<any>
) => React.ReactElement;
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { memo, useRef, useEffect } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcEdit from "@/assets/icons/edit.svg";
import IcPlus from "@/assets/icons/plus.svg";
import IconButton from "@/components/ui/IconButton";
import { t } from "@/services/i18n";
import EmptyState from "@/components/ui/EmptyState";
import { useProductsQuery } from "@/services/queries/useProductsQuery";
import type { Product } from "@/services/types/Product";
import { formatCurrency } from "@/utils/Format";
import { vs } from "@/utils/Scale";
import MenuListSkeleton from "./MenuListSkeleton";
import { useCategoryStore } from "@/store/useMenuCategoryStore";
import { useSyncStore } from "@/store/useSyncStore";
import { useAuthStore } from "@/store/useAuthStore";

interface MenuListProps {
	scrollHandler?: (event: any) => void;
	editable?: boolean;
}

interface ProductCardProps {
	item: Product;
	editable?: boolean;
}

const NUM_COLUMNS = 4;

const MenuList = ({ scrollHandler, editable }: MenuListProps) => {
	const selectedCategory = useCategoryStore((s) => s.selectedCategory);
	const searchQuery = useCategoryStore((s) => s.searchQuery);
	const isSyncing = useSyncStore((s) => s.isSyncing);
	const listRef = useRef<any>(null);

	const isSearching = searchQuery.length >= 2;

	const { data, isLoading } = useProductsQuery({
		page: 0,
		size: 16,
		sortBy: "name",
		sortDir: "asc",
		categoryCode: isSearching ? undefined : (selectedCategory === "ALL" ? undefined : selectedCategory),
		keyword: isSearching ? searchQuery : undefined,
		includeDeleted: editable,
	});

	useEffect(() => {
		if (listRef.current) {
			listRef.current.scrollToOffset({ offset: 0, animated: false });
		}
	}, [selectedCategory, searchQuery]);

	const showLoader =
		isLoading || (isSyncing && (!data?.content || data.content.length === 0));

	// Authorization check
	const user = useAuthStore((state) => state.user);
	const canEditMenu = user?.roleCode === "OWNER" || user?.roleCode === "MANAGER";

	if (showLoader) {
		return <MenuListSkeleton />;
	}

	return (
		<>
			<AnimatedFlashList
				ref={listRef}
				contentContainerStyle={$.content}
				data={data?.content || []}
				keyExtractor={(item) => item.id.toString()}
				numColumns={NUM_COLUMNS}
				onScroll={scrollHandler}
				renderItem={({ item }) => (
					<ProductCard editable={editable} item={item} />
				)}
				scrollEventThrottle={16}
				showsVerticalScrollIndicator={false}
				style={$.container}
				estimatedItemSize={250}
				ListEmptyComponent={
					<EmptyState
						title={isSearching ? t("empty_menu_search_title") : t("empty_menu_category_title")}
						subtitle={
							isSearching
								? t("empty_menu_search_subtitle")
								: t("empty_menu_category_subtitle")
						}
						style={{ marginTop: vs(100) }}
					/>
				}
			/>
			{!editable && canEditMenu && <MenuActions />}
		</>
	);
};

const MenuActions = memo(() => {
	const router = useRouter();
	return (
		<View style={$.actionsContainer}>
			<IconButton
				Icon={IcEdit}
				onPress={() => router.push("/product/edit-list")}
				size="lg"
				variant="secondary"
			/>
			<IconButton
				Icon={IcPlus}
				onPress={() => router.push("/product/add")}
				size="lg"
				variant="primary"
			/>
		</View>
	);
});

const ProductCard = memo(({ item, editable }: ProductCardProps) => {
	const router = useRouter();
	const isDeleted = !!item.deletedAt;

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={() => {
				if (editable) {
					router.push({
						pathname: "/product/add",
						params: { id: item.id },
					});
				} else {
					if (isDeleted) return;

					router.push({
						pathname: "/modal/order/add-item",
						params: {
							id: item.id,
							name: item.name,
							sellingPrice: item.sellingPrice,
							imageUrl: item.imageUrl,
							tax: item.tax,
							commission: item.commission,
						},
					});
				}
			}}
			style={[$.productContainer, isDeleted && $.productDeleted]}
		>
			<View>
				<Image
					contentFit="cover"
					source={item.imageUrl}
					style={[$.productImage, isDeleted && $.productImageDeleted]}
				/>
				{editable && (
					<View style={$.editIconOverlay}>
						<IcEdit color="white" height={vs(16)} width={vs(16)} />
					</View>
				)}
				{isDeleted && (
					<View style={$.deletedOverlay}>
						<Text style={$.deletedText}>{t("hidden")}</Text>
					</View>
				)}
			</View>
			<View style={$.productInfoWrapper}>
				<Text style={[$.productName, isDeleted && $.textDeleted]}>{item.name}</Text>
				<Text style={[$.productPrice, isDeleted && $.textDeleted]}>{formatCurrency(item.sellingPrice)}</Text>
			</View>
		</TouchableOpacity>
	);
});

ProductCard.displayName = "ProductCard";

const $ = StyleSheet.create((theme, rt) => ({
	container: {
		marginLeft: theme.spacing.xl,
		marginRight: theme.spacing.xs,
		gap: theme.spacing.xxl,
		flex: 1,
	},
	content: {
		paddingTop: vs(80),
	},
	productContainer: {
		gap: theme.spacing.sm,
		backgroundColor: theme.colors.neutral[100],
		borderRadius: theme.radius.md,
		borderWidth: vs(1),
		borderColor: theme.colors.neutral[300],
		padding: theme.spacing.md,
		flexGrow: 1,
		marginRight: vs(20),
		marginBottom: vs(20),
	},
	productImage: {
		aspectRatio: 177 / 96,
		borderRadius: theme.radius.sm,
	},
	editIconOverlay: {
		position: "absolute",
		top: theme.spacing.xs,
		right: theme.spacing.xs,
		backgroundColor: theme.colors.primary[400],
		padding: theme.spacing.xs,
		borderRadius: theme.radius.xs,
		zIndex: 20,
	},
	productInfoWrapper: {
		gap: theme.spacing.xs,
	},
	productName: {
		...theme.typography.heading5,
		color: theme.colors.neutral[700],
	},
	productPrice: {
		...theme.typography.labelMd,
		color: theme.colors.primary[400],
	},
	actionsContainer: {
		flexDirection: "row",
		gap: vs(20),
		position: "absolute",
		bottom: rt.insets.bottom || theme.spacing.xl,
		right: theme.spacing.xl,
		zIndex: 10,
	},
	productDeleted: {
		backgroundColor: theme.colors.neutral[100],
		borderColor: theme.colors.neutral[200],
	},
	productImageDeleted: {
		opacity: 0.5,
	},
	textDeleted: {
		color: theme.colors.neutral[400],
	},
	deletedOverlay: {
		position: "absolute",
		top: theme.spacing.xs,
		left: theme.spacing.xs,
		backgroundColor: theme.colors.neutral[600],
		paddingHorizontal: theme.spacing.xs,
		paddingVertical: 2,
		borderRadius: theme.radius.xs,
		zIndex: 20,
	},
	deletedText: {
		...theme.typography.labelSm,
		color: "white",
	},
}));

export default MenuList;
