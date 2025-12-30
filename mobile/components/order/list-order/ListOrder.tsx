import { FlashList as ShopifyFlashList, type FlashListProps } from "@shopify/flash-list";
import React, { useState } from "react";
import { useRouter } from "expo-router";

// Workaround for missing estimatedItemSize in FlashList props type definition
const FlashList = ShopifyFlashList as unknown as <T>(
	props: FlashListProps<T> & { estimatedItemSize: number }
) => React.ReactElement;

import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import {
	useOrderStore,
	selectSubtotal,
} from "@/store/useOrderStore";
import { formatCurrency } from "@/utils/Format";
import Button from "@/components/ui/Button";
import DottedLine from "@/components/ui/DottedLine";
import OrderItem from "./OrderItem";
import { t } from "@/services/i18n";

interface CurvedShapeProps {
	rotate?: number;
}

const ListOrder = () => {
	const router = useRouter();
	const items = useOrderStore((state) => state.items);
	const clearOrder = useOrderStore((state) => state.clearOrder);
	const removeItem = useOrderStore((state) => state.removeItem);

	const [expandedId, setExpandedId] = useState<string | null>(null);

	const handleToggle = (id: string) => {
		setExpandedId((prev) => (prev === id ? null : id));
	};

	const handleEdit = (item: any) => {
		router.push({
			pathname: "/modal/order/add-item",
			params: {
				id: item.productId,
				orderItemId: item.id,
				name: item.name,
				sellingPrice: item.sellingPrice,
				imageUrl: item.imageUrl,
				tax: item.tax,
				commission: item.commission,
				initialQuantity: item.quantity,
				initialNote: item.note,
				initialDiscount: item.discount,
				initialVariants: JSON.stringify(item.variants),
			},
		});
	};

	return (
		<View style={$.container}>
			<View style={$.header}>
				<Text style={$.title}>{t("list_of_order")}</Text>
				<Button
					size="sm"
					title={t("remove_all")}
					variant="link"
					onPress={clearOrder}
				/>
			</View>
			<FlashList
				data={items}
				extraData={expandedId}
				renderItem={({ item, index }) => (
					<OrderItem
						item={item}
						index={index + 1}
						isExpanded={expandedId === item.id}
						onToggle={() => handleToggle(item.id)}
						onRemove={() => removeItem(item.id)}
						onEdit={() => handleEdit(item)}
					/>
				)}
				estimatedItemSize={100}
				ListFooterComponent={Footer}
				contentContainerStyle={$.content}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
};

const Footer = () => {
	const router = useRouter();
	const items = useOrderStore((state) => state.items);
	// Basic calculation
	const subtotal = selectSubtotal(items);
	// Mock tax for global tax (if any)
	const globalTax = useOrderStore((state) => 0);
	const globalDiscount = useOrderStore((state) => state.discount) || 0;

	const totalItemDiscounts = items.reduce(
		(sum, item) => sum + (item.discount || 0),
		0,
	);

	const totalItemTax = items.reduce(
		(sum, item) => sum + (item.tax || 0),
		0,
	);

	// Aggregated Totals
	const finalDiscount = globalDiscount + totalItemDiscounts;
	const finalTax = globalTax + totalItemTax;

	// Total Calculation: Subtotal (Gross) - Total Discounts + Total Taxes
	const total = subtotal - finalDiscount + finalTax;

	const renderItem = (label: string, value: string) => {
		return (
			<View style={$.summaryItem}>
				<Text adjustsFontSizeToFit style={$.summaryLabel}>{label}</Text>
				<Text
					style={$.summaryValue}
					numberOfLines={1}
					adjustsFontSizeToFit
				>
					{value}
				</Text>
			</View>
		);
	};

	return (
		<View style={$.footer}>
			<Button
				size="sm"
				title={t("add_discount")}
				variant="secondary"
				onPress={() => router.push("/modal/order/discount")}
				disabled={items.length === 0}
			/>

			<View style={$.summaryColumn}>
				<Text style={$.title}>{t("order_summary")}</Text>
				<View style={$.summaryCard}>
					<View style={$.summaryTop}>
						{renderItem(t("subtotal"), formatCurrency(subtotal))}
						{finalDiscount > 0 &&
							renderItem(t("discount"), `- ${formatCurrency(finalDiscount)}`)}
						{finalTax > 0 && renderItem(t("tax"), formatCurrency(finalTax))}
					</View>

					{/* Only show separator if we have details */}
					<View style={$.summarySeparatorRow}>
						<CurvedShape rotate={0} />
						<DottedLine />
						<CurvedShape rotate={180} />
					</View>

					<View style={[$.summaryBottom, $.summaryItem]}>
						<Text adjustsFontSizeToFit style={$.totalLabelText}>{t("total")}</Text>
						<Text
							style={$.totalValueText}
							numberOfLines={1}
							adjustsFontSizeToFit
						>
							{formatCurrency(total)}
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
};

const CurvedShape = ({ rotate = 0 }: CurvedShapeProps) => {
	const shapeColor = UnistylesRuntime.getTheme().colors.neutral[100];

	return (
		<Svg
			fill="none"
			height={24}
			transform={[{ rotate: `${rotate}deg` }]}
			viewBox="0 0 12 24"
			width={12}
		>
			<Path
				d="M0 0C1.57586 1.8792e-08 3.13629 0.310389 4.5922 0.913446C6.04811 1.5165 7.37098 2.40042 8.48528 3.51472C9.59958 4.62902 10.4835 5.95189 11.0866 7.4078C11.6896 8.86371 12 10.4241 12 12C12 13.5759 11.6896 15.1363 11.0866 16.5922C10.4835 18.0481 9.59958 19.371 8.48528 20.4853C7.37098 21.5996 6.04811 22.4835 4.5922 23.0866C3.13629 23.6896 1.57586 24 -3.8147e-06 24L0 12V0Z"
				fill={shapeColor}
			/>
		</Svg>
	);
};

const $ = StyleSheet.create((theme) => ({
	container: {
		flex: 1,
		gap: theme.spacing.lg,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: theme.spacing.lg,
		paddingHorizontal: theme.spacing.xl,
	},
	title: {
		...theme.typography.labelMd,
		color: theme.colors.neutral[700],
	},
	content: {
		paddingHorizontal: theme.spacing.xl,
		paddingBottom: theme.spacing.xl + 100, // accommodate absolute footer
	},
	footer: {
		gap: theme.spacing.lg,
		marginTop: theme.spacing.lg,
	},
	summaryColumn: {
		gap: theme.spacing.md,
	},
	summaryCard: {
		borderRadius: theme.radius.lg,
		backgroundColor: theme.colors.sup.yellow,
	},
	summaryItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: theme.spacing.md,
	},
	summaryLabel: {
		...theme.typography.bodySm,
		color: theme.colors.neutral[600],
	},
	summaryValue: {
		...theme.typography.labelSm,
		color: theme.colors.neutral[700],
	},
	summaryTop: {
		paddingHorizontal: theme.spacing.md,
		paddingTop: theme.spacing.md,
		gap: theme.spacing.sm,
	},
	summarySeparatorRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	summaryBottom: {
		paddingHorizontal: theme.spacing.md,
		paddingBottom: theme.spacing.md,
	},
	totalLabelText: {
		...theme.typography.heading5,
		color: theme.colors.neutral[700],
	},
	totalValueText: {
		...theme.typography.heading5,
		color: theme.colors.primary[400],
	},
}));

export default ListOrder;
