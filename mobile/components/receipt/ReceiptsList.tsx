import { FlashList as ShopifyFlashList, type FlashListProps } from "@shopify/flash-list";
import React from "react";

// Workaround for missing estimatedItemSize in FlashList props type definition
const FlashList = ShopifyFlashList as unknown as <T>(
	props: FlashListProps<T> & { estimatedItemSize: number }
) => React.ReactElement;
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// dayjs.extend(utc);
// dayjs.extend(timezone);
import { memo } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Button from "@/components/ui/Button";
import { t } from "@/services/i18n";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { useTransactionsQuery } from "@/services/queries/useTransactionsQuery";
import { TransactionResponse } from "@/services/types/Transaction";
import { formatCurrency } from "@/utils/Format";
import { useRouter } from "expo-router";

const COLUMNS = [
	{ label: "Time", flex: 1 },
	{ label: "Transaction ID", flex: 1.5 },
	{ label: "Customer", flex: 1.5 },
	{ label: "Payment Method", flex: 1.2 },
	{ label: "Item", flex: 1 },
	{ label: "Total Amount", flex: 1.2 },
	{ label: "Status", flex: 1 },
	{ label: "Action", flex: 1 },
];

interface ReceiptsListProps {
	startDate?: string;
	endDate?: string;
	searchQuery?: string;
}

const ReceiptsList = ({ startDate, endDate, searchQuery }: ReceiptsListProps) => {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useTransactionsQuery({
		size: 20,
		sortDir: "desc",
		sortBy: "createdAt",
		startDate,
		endDate,
		search: searchQuery,
	});

	// Flatten pages
	const transactions = data?.pages.flatMap(page => page.content) || [];

	const renderSkeleton = () => (
		<View style={$.container}>
			<View style={$.header}>
				{COLUMNS.map((col) => (
					<Skeleton
						key={col.label}
						style={{ flex: col.flex, marginRight: 10 }}
						height={20}
					/>
				))}
			</View>
			<View style={$.listContent}>
				{[...Array(10)].map((_, index) => (
					<View key={index} style={$.row}>
						{COLUMNS.map((col, cIndex) => (
							<Skeleton
								key={cIndex}
								style={{ flex: col.flex, marginRight: 10 }}
								height={20}
							/>
						))}
					</View>
				))}
			</View>
		</View>
	);

	if (isLoading) {
		return renderSkeleton();
	}

	return (
		<View style={$.container}>
			{transactions.length > 0 && (
				<View style={$.header}>
					{COLUMNS.map((col) => (
						<Text key={col.label} style={[$.headerText, { flex: col.flex }]}>
							{col.label}
						</Text>
					))}
				</View>
			)}
			<FlashList<TransactionResponse>
				contentContainerStyle={[$.listContent, transactions.length === 0 && { flex: 1 }]}
				data={transactions}
				estimatedItemSize={80}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <TransactionRow item={item} />}
				ItemSeparatorComponent={() => <View style={$.separator} />}
				ListEmptyComponent={
					<EmptyState
						title={t("empty_transactions_title")}
						subtitle={t("empty_transactions_date_subtitle")}
					/>
				}
				onEndReached={() => {
					if (hasNextPage) fetchNextPage();
				}}
				onEndReachedThreshold={0.5}
				ListFooterComponent={
					isFetchingNextPage ? (
						<View style={{ padding: 10, alignItems: 'center' }}>
							<Text>Loading more...</Text>
						</View>
					) : null
				}
			/>
		</View>
	);
};

const TransactionRow = memo(({ item }: { item: TransactionResponse }) => {
	const router = useRouter();
	return (
		<View style={$.row}>
			{/* Time */}
			<View style={{ flex: COLUMNS[0].flex }}>
				<Text style={$.timeText}>{dayjs.utc(item.createdAt).local().format("HH:mm")}</Text>
				<Text style={$.dateText}>
					{dayjs.utc(item.createdAt).local().format("ddd, DD MMM YYYY")}
				</Text>
			</View>

			{/* Transaction Number/ID */}
			<View style={{ flex: COLUMNS[1].flex }}>
				<Text style={$.cellText} numberOfLines={1}>
					{item.id.substring(0, 8)}...
				</Text>
			</View>

			{/* Customer */}
			<View style={{ flex: COLUMNS[2].flex }}>
				<Text style={$.cellText} numberOfLines={1}>
					{item.description
						? item.description.split(" - ")[0].replace("Order for ", "")
						: "-"}
				</Text>
			</View>

			{/* Payment Method */}
			<View style={{ flex: COLUMNS[3].flex }}>
				<Text style={$.cellText}>{item.paymentMethodCode}</Text>
			</View>

			{/* Total Order */}
			<View style={{ flex: COLUMNS[4].flex }}>
				<Text style={$.cellText}>
					{item.transactionProduct?.reduce((acc, curr) => acc + (curr.quantity || 1), 0) || 0}
				</Text>
			</View>

			{/* Total Amount */}
			<View style={{ flex: COLUMNS[5].flex }}>
				<Text style={$.cellText}>{formatCurrency(item.totalPrice)}</Text>
			</View>

			{/* Status */}
			<View style={{ flex: COLUMNS[6].flex }}>
				<StatusBadge status={item.statusCode} />
			</View>

			{/* Action */}
			<View style={{ flex: COLUMNS[7].flex }}>
				<Button
					size="sm"
					title={t("detail")}
					variant="neutral"
					onPress={() => router.push({
						pathname: `/receipt/detail`,
						params: { transaction: JSON.stringify(item) }
					})}
				/>
			</View>
		</View>
	);
});

const StatusBadge = ({ status }: { status: string }) => {
	const isCompleted = status === "COMPLETED";
	$.useVariants({ status: isCompleted ? "completed" : "refund" });

	return (
		<View style={$.badge}>
			<Text style={$.badgeText}>{status}</Text>
		</View>
	);
};

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
	badge: {
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.xs,
		borderRadius: theme.radius.sm,
		borderWidth: 1,
		alignSelf: "flex-start",
		variants: {
			status: {
				completed: {
					backgroundColor: theme.colors.positive[100],
					borderColor: theme.colors.positive[300],
				},
				refund: {
					backgroundColor: theme.colors.error[100],
					borderColor: theme.colors.error[300],
				},
			},
		},
	},
	badgeText: {
		...theme.typography.labelSm,
		variants: {
			status: {
				completed: {
					color: theme.colors.positive[500],
				},
				refund: {
					color: theme.colors.error[500],
				},
			},
		},
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

export default ReceiptsList;
