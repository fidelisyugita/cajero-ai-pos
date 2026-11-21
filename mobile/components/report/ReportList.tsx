import { AnimatedFlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { memo, useCallback } from "react";
import { type NativeScrollEvent, type NativeSyntheticEvent, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton, { SkeletonGroup } from "@/components/ui/Skeleton";
import { t } from "@/services/i18n";
import type { DailyReport } from "@/services/types/Report";
import { formatDate, formatDayName } from "@/utils/Date";
import { formatCurrency } from "@/utils/Format";

interface ReportListProps {
  data: DailyReport[];
  isLoading: boolean;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const COLUMNS = [
  { label: "Date", flex: 1.5 },
  { label: "Transaction", flex: 1 },
  { label: "Item Sales", flex: 1 },
  { label: "Revenue", flex: 1.5 },
  { label: "Refund", flex: 1.5 },
  { label: "Net Revenue", flex: 1.5 },
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
const EMPTY_REPORTS: DailyReport[] = [];
const keyExtractor = (item: unknown) => (item as DailyReport).date;

const ReportListSkeleton = memo(() => (
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

const ReportEmptyState = memo(() => (
  <EmptyState title={t("empty_reports_title")} subtitle={t("empty_reports_date_subtitle")} />
));

const ReportList = memo(({ data, isLoading, onScroll }: ReportListProps) => {
  const router = useRouter();

  const handlePressDetail = useCallback(
    (item: DailyReport) => {
      router.push({
        pathname: "/report/detail",
        params: { report: JSON.stringify(item) },
      });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: unknown }) => (
      <ReportRow item={item as DailyReport} onPressDetail={handlePressDetail} />
    ),
    [handlePressDetail],
  );

  if (isLoading) {
    return <ReportListSkeleton />;
  }

  const reports = data || EMPTY_REPORTS;

  return (
    <View style={$.container}>
      {reports.length > 0 && (
        <View style={$.header}>
          {COLUMNS.map((col, index) => (
            <Text key={col.label} style={HEADER_CELL_STYLES[index]}>
              {col.label}
            </Text>
          ))}
        </View>
      )}
      <AnimatedFlashList
        contentContainerStyle={reports.length === 0 ? EMPTY_LIST_CONTAINER_STYLE : $.listContent}
        data={reports}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ReportSeparator}
        ListEmptyComponent={ReportEmptyState}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
});

const ReportSeparator = memo(() => <View style={$.separator} />);

const ReportRow = memo(
  ({ item, onPressDetail }: { item: DailyReport; onPressDetail: (item: DailyReport) => void }) => {
    const handlePress = useCallback(() => onPressDetail(item), [onPressDetail, item]);

    return (
      <View style={$.row}>
        {/* Time */}
        <View style={COL_FLEX_STYLES[0]}>
          <Text style={$.timeText}>{formatDayName(item.date)}</Text>
          <Text style={$.dateText}>{formatDate(item.date)}</Text>
        </View>

        {/* Transactions */}
        <View style={COL_FLEX_STYLES[1]}>
          <Text style={$.cellText}>{item.totalTransaction}</Text>
        </View>

        {/* Product Sales */}
        <View style={COL_FLEX_STYLES[2]}>
          <Text style={$.cellText}>{item.totalProductSold}</Text>
        </View>

        {/* Revenue */}
        <View style={COL_FLEX_STYLES[3]}>
          <Text style={REVENUE_TEXT_STYLE}>{formatCurrency(item.totalRevenue)}</Text>
        </View>

        {/* Refund */}
        <View style={COL_FLEX_STYLES[4]}>
          <Text style={REFUND_TEXT_STYLE}>{formatCurrency(item.totalRefund)}</Text>
        </View>

        {/* Net Revenue */}
        <View style={COL_FLEX_STYLES[5]}>
          <Text style={NET_REVENUE_TEXT_STYLE}>{formatCurrency(item.totalNetRevenue)}</Text>
        </View>

        {/* Action */}
        <View style={COL_FLEX_STYLES[6]}>
          <Button size="sm" title={t("detail")} variant="neutral" onPress={handlePress} />
        </View>
      </View>
    );
  },
);

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

const HEADER_CELL_STYLES = COLUMNS.map((col) => [$.headerText, { flex: col.flex }]);
const EMPTY_LIST_CONTAINER_STYLE = [$.listContent, $.emptyListContent];
const REVENUE_TEXT_STYLE = [$.cellText, { color: "green" } as const];
const REFUND_TEXT_STYLE = [$.cellText, { color: "red" } as const];
const NET_REVENUE_TEXT_STYLE = [$.cellText, { fontWeight: "bold" } as const];

export default ReportList;
