import { FlashList as ShopifyFlashList, type FlashListProps } from "@shopify/flash-list";
import React from "react";

// Workaround for missing estimatedItemSize in FlashList props type definition
const FlashList = ShopifyFlashList as unknown as <T>(
	props: FlashListProps<T> & { estimatedItemSize: number }
) => React.ReactElement;
import dayjs from "dayjs";
import { memo } from "react";
import { Text, View, Alert } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Button from "@/components/ui/Button";
import { t } from "@/services/i18n";
import EmptyState from "@/components/ui/EmptyState";
import { useDraftStore, DraftOrder } from "@/store/useDraftStore";
import { useOrderStore } from "@/store/useOrderStore";
import { formatCurrency } from "@/utils/Format";
import { useRouter } from "expo-router";

const COLUMNS = [
	{ label: "Time", flex: 1 },
	{ label: "Draft ID", flex: 1.5 },
	{ label: "Customer", flex: 1.5 },
	{ label: "Item", flex: 1.2 },
	{ label: "Total Amount", flex: 1.2 },
	{ label: "Action", flex: 1 },
];

interface DraftListProps {
	searchQuery?: string;
}

const DraftList = ({ searchQuery = "" }: DraftListProps) => {
	const drafts = useDraftStore((state) => state.drafts);

	const filteredDrafts = drafts.filter((draft) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			draft.id.toLowerCase().includes(query) ||
			(draft.customerName || "").toLowerCase().includes(query) ||
			(draft.tableNumber || "").toLowerCase().includes(query) // Optional: search by table number
		);
	});

	return (
		<View style={$.container}>
			{filteredDrafts.length > 0 && (
				<View style={$.header}>
					{COLUMNS.map((col) => (
						<Text key={col.label} style={[$.headerText, { flex: col.flex }]}>
							{col.label}
						</Text>
					))}
				</View>
			)}
			<FlashList
				contentContainerStyle={[$.listContent, filteredDrafts.length === 0 && { flex: 1 }]}
				data={filteredDrafts}
				estimatedItemSize={80}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <DraftRow item={item} />}
				ItemSeparatorComponent={() => <View style={$.separator} />}
				ListEmptyComponent={
					<EmptyState
						title={t("empty_drafts_title")}
						subtitle={t("empty_drafts_subtitle")}
					/>
				}
			/>
		</View>
	);
};

const DraftRow = memo(({ item }: { item: DraftOrder }) => {
	const router = useRouter();
	const { items: currentItems, clearOrder, addItem, setCustomerName, setTableNumber, setDiscount } = useOrderStore();
	const removeDraft = useDraftStore((state) => state.removeDraft);

	const calculateTotal = (order: DraftOrder) => {
		const subtotal = order.items.reduce((total, item) => {
			const variantTotal = item.variants.reduce((vt, v) => vt + v.price, 0);
			return total + (item.sellingPrice + variantTotal) * item.quantity;
		}, 0);
		const itemDiscounts = order.items.reduce((sum, item) => sum + (item.discount || 0), 0);
		return subtotal - itemDiscounts - order.discount;
	};

	const handleResume = () => {
		const resumeOrder = () => {
			// 1. Clear current order
			clearOrder();

			// 2. Restore items
			// We need to add items one by one or expose a bulk setter in store. 
			// For now, let's just loop. A bulk setter would be better for perf but loop is fine for POS size.
			// Actually, we can just use the store setters if we refactor store or just loop carefully.
			// Just looping addItem generates new IDs which is fine.
			item.items.forEach(orderItem => {
				// We strip ID because addItem generates a new one, 
				// or we could potentially force ID if we wanted exact restore, 
				// but new ID is cleaner to avoid conflicts.
				const { id, ...rest } = orderItem;
				addItem(rest);
			});

			// 3. Restore metadata
			setCustomerName(item.customerName);
			setTableNumber(item.tableNumber);
			setDiscount(item.discount);

			// 4. Remove from drafts
			removeDraft(item.id);

			// 5. Navigate
			router.push("/(dashboard)/menu");
		};

		if (currentItems.length > 0) {
			Alert.alert(
				"Overwrite current order?",
				"You have active items in your cart. Resuming this draft will clear them.",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Overwrite",
						style: "destructive",
						onPress: resumeOrder
					}
				]
			);
		} else {
			resumeOrder();
		}
	};

	return (
		<View style={$.row}>
			{/* Time */}
			<View style={{ flex: COLUMNS[0].flex }}>
				<Text style={$.timeText}>{dayjs(item.savedAt).format("HH:mm")}</Text>
				<Text style={$.dateText}>
					{dayjs(item.savedAt).format("ddd, DD MMM")}
				</Text>
			</View>

			{/* Draft ID */}
			<View style={{ flex: COLUMNS[1].flex }}>
				<Text style={$.cellText} numberOfLines={1}>
					{item.id}
				</Text>
			</View>

			{/* Customer */}
			<View style={{ flex: COLUMNS[2].flex }}>
				<Text style={$.cellText} numberOfLines={1}>
					{[item.customerName, item.tableNumber ? `Table ${item.tableNumber}` : null]
						.filter(Boolean)
						.join(" - ") || "-"}
				</Text>
			</View>

			{/* Items Information */}
			<View style={{ flex: COLUMNS[3].flex }}>
				<Text style={$.cellText} numberOfLines={1}>
					{item.items.reduce((acc, curr) => acc + (curr.quantity || 1), 0)}
				</Text>
			</View>

			{/* Total Amount */}
			<View style={{ flex: COLUMNS[4].flex }}>
				<Text style={$.cellText}>{formatCurrency(calculateTotal(item))}</Text>
			</View>

			{/* Action */}
			<View style={{ flex: COLUMNS[5].flex }}>
				<Button
					size="sm"
					title="Resume"
					variant="primary"
					onPress={handleResume}
				/>
			</View>
		</View>
	);
});

const $ = StyleSheet.create((theme) => ({
	container: {
		flex: 1,
		backgroundColor: theme.colors.neutral[100],
		borderRadius: theme.radius.lg,
		borderWidth: 1,
		borderColor: theme.colors.neutral[300],
		overflow: "hidden",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.sup.red,
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.neutral[300],
	},
	headerText: {
		...theme.typography.labelMd,
		color: theme.colors.neutral[700],
	},
	listContent: {
		paddingHorizontal: theme.spacing.lg,
	},
	separator: {
		height: 1,
		backgroundColor: theme.colors.neutral[200],
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: theme.spacing.md,
	},
	timeText: {
		...theme.typography.labelMd,
		color: theme.colors.neutral[700],
	},
	dateText: {
		...theme.typography.bodySm,
		color: theme.colors.neutral[500],
	},
	cellText: {
		...theme.typography.bodyMd,
		color: theme.colors.neutral[700],
		paddingRight: theme.spacing.sm,
	},
	emptyContainer: {
		padding: theme.spacing.xl,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyText: {
		...theme.typography.bodyLg,
		color: theme.colors.neutral[500],
	},
}));

export default DraftList;
