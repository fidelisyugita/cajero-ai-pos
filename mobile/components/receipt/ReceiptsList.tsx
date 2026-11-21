import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { memo, useCallback, useMemo } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton, { SkeletonGroup } from "@/components/ui/Skeleton";
import { t } from "@/services/i18n";
import { useTransactionsQuery } from "@/services/queries/useTransactionsQuery";
import type { TransactionResponse } from "@/services/types/Transaction";
import { formatDayDateYear, formatTime } from "@/utils/Date";
import { formatCurrency } from "@/utils/Format";

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

const SKELETON_ROWS = [
  "sk-1",
  "sk-2",
  "sk-3",
  "sk-4",
  "sk-5",
  "sk-6",
  "sk-7",
  "sk-8",
  "sk-9",
  "sk-10",
];
const SKELETON_CELL_STYLES = COLUMNS.map((col) => ({ flex: col.flex, marginRight: 10 }));
const COL_FLEX_STYLES = COLUMNS.map((col) => ({ flex: col.flex }));
const EMPTY_TRANSACTIONS: TransactionResponse[] = [];
const keyExtractor = (item: TransactionResponse) => item.id;

const ReceiptsListSkeleton = memo(() => (
  <View style={$.container}>
    <View style={$.header}>
      <SkeletonGroup style={$.skeletonHeader}>
        {COLUMNS.map((col, index) => (
          <Skeleton key={col.label} style={SKELETON_CELL_STYLES[index]} height={20} />
        ))}
      </SkeletonGroup>
    </View>
    <SkeletonGroup style={$.listContent}>
      {SKELETON_ROWS.map((rowKey) => (
        <View key={rowKey} style={$.row}>
          {COLUMNS.map((col, index) => (
            <Skeleton
              key={`${rowKey}-${col.label}`}
              style={SKELETON_CELL_STYLES[index]}
              height={20}
            />
          ))}
        </View>
      ))}
    </SkeletonGroup>
  </View>
));

interface ReceiptsListProps {
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

const ReceiptEmptyState = memo(() => (
  <EmptyState
    title={t("empty_transactions_title")}
    subtitle={t("empty_transactions_date_subtitle")}
  />
));

const ReceiptFooter = memo(() => (
  <View style={$.footerLoading}>
    <Text>Loading more...</Text>
  </View>
));

const ReceiptsList = memo(({ startDate, endDate, searchQuery }: ReceiptsListProps) => {
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useTransactionsQuery({
    size: 20,
    sortDir: "desc",
    sortBy: "createdAt",
    startDate,
    endDate,
    search: searchQuery,
  });

  // Flatten pages
  const transactions = useMemo(
    () => data?.pages.flatMap((page) => page.content) || EMPTY_TRANSACTIONS,
    [data],
  );

  const handlePressDetail = useCallback(
    (item: TransactionResponse) => {
      router.push({
        pathname: "/receipt/detail",
        params: { transaction: JSON.stringify(item) },
      });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: TransactionResponse }) => (
      <TransactionRow item={item} onPressDetail={handlePressDetail} />
    ),
    [handlePressDetail],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

  if (isLoading) {
    return <ReceiptsListSkeleton />;
  }

  return (
    <View style={$.container}>
      {transactions.length > 0 && (
        <View style={$.header}>
          {COLUMNS.map((col, index) => (
            <Text key={col.label} style={HEADER_CELL_STYLES[index]}>
              {col.label}
            </Text>
          ))}
        </View>
      )}
      <FlashList<TransactionResponse>
        contentContainerStyle={
          transactions.length === 0 ? EMPTY_LIST_CONTAINER_STYLE : $.listContent
        }
        data={transactions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ReceiptSeparator}
        ListEmptyComponent={ReceiptEmptyState}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? ReceiptFooter : null}
      />
    </View>
  );
});

const ReceiptSeparator = memo(() => <View style={$.separator} />);

const TransactionRow = memo(
  ({
    item,
    onPressDetail,
  }: {
    item: TransactionResponse;
    onPressDetail: (item: TransactionResponse) => void;
  }) => {
    const handlePress = useCallback(() => onPressDetail(item), [onPressDetail, item]);

    return (
      <View style={$.row}>
        {/* Time */}
        <View style={COL_FLEX_STYLES[0]}>
          <Text style={$.timeText}>{formatTime(item.createdAt)}</Text>
          <Text style={$.dateText}>{formatDayDateYear(item.createdAt)}</Text>
        </View>

        {/* Transaction Number/ID */}
        <View style={COL_FLEX_STYLES[1]}>
          <Text style={$.cellText} numberOfLines={1}>
            {item.id.substring(0, 8)}...
          </Text>
        </View>

        {/* Customer */}
        <View style={COL_FLEX_STYLES[2]}>
          <Text style={$.cellText} numberOfLines={1}>
            {item.description ? item.description.split(" - ")[0].replace("Order for ", "") : "-"}
          </Text>
        </View>

        {/* Payment Method */}
        <View style={COL_FLEX_STYLES[3]}>
          <Text style={$.cellText}>{item.paymentMethodCode}</Text>
        </View>

        {/* Total Order */}
        <View style={COL_FLEX_STYLES[4]}>
          <Text style={$.cellText}>
            {item.transactionProduct?.reduce((acc, curr) => acc + (curr.quantity || 1), 0) || 0}
          </Text>
        </View>

        {/* Total Amount */}
        <View style={COL_FLEX_STYLES[5]}>
          <Text style={$.cellText}>{formatCurrency(item.totalPrice)}</Text>
        </View>

        {/* Status */}
        <View style={COL_FLEX_STYLES[6]}>
          <StatusBadge status={item.statusCode} />
        </View>

        {/* Action */}
        <View style={COL_FLEX_STYLES[7]}>
          <Button size="sm" title={t("detail")} variant="neutral" onPress={handlePress} />
        </View>
      </View>
    );
  },
);

const StatusBadge = memo(({ status }: { status: string }) => {
  const isCompleted = status === "COMPLETED";
  $.useVariants({ status: isCompleted ? "completed" : "refund" });

  return (
    <View style={$.badge}>
      <Text style={$.badgeText}>{status}</Text>
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
  skeletonHeader: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    ...theme.typography.labelMd,
    color: theme.colors.neutral[700],
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  emptyListContent: {
    flex: 1,
  },
  footerLoading: {
    padding: 10,
    alignItems: "center",
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

const HEADER_CELL_STYLES = COLUMNS.map((col) => [$.headerText, { flex: col.flex }]);
const EMPTY_LIST_CONTAINER_STYLE = [$.listContent, $.emptyListContent];

export default ReceiptsList;
