import { FlashList } from "@shopify/flash-list";
import { memo, useCallback, useState } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ExpenseDetailModal from "@/components/expense/ExpenseDetailModal";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton, { SkeletonGroup } from "@/components/ui/Skeleton";
import { t } from "@/services/i18n";
import { usePettyCashQuery } from "@/services/queries/usePettyCashQuery";
import type { PettyCash } from "@/services/types/PettyCash";
import { formatDayDate, formatTime } from "@/utils/Date";
import { formatCurrency } from "@/utils/Format";

const COLUMNS = [
  { label: "Time", flex: 1 },
  { label: "Description", flex: 2 },
  { label: "Type", flex: 1 },
  { label: "Amount", flex: 1.5 },
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
const EMPTY_EXPENSES: PettyCash[] = [];
const keyExtractor = (item: PettyCash) => item.id;

const ExpenseListSkeleton = memo(() => (
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

interface ExpenseListProps {
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

const ExpenseEmptyState = memo(() => (
  <EmptyState title={t("empty_expenses_title")} subtitle={t("empty_expenses_date_subtitle")} />
));

const ExpenseList = memo(({ startDate, endDate, searchQuery }: ExpenseListProps) => {
  const { data, isLoading } = usePettyCashQuery({
    startDate,
    endDate,
    page: 0,
    size: 20,
    sortBy: "createdAt",
    sortDir: "desc",
    keyword: searchQuery,
  });

  const [selectedExpense, setSelectedExpense] = useState<PettyCash | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  const handlePressItem = useCallback((item: PettyCash) => {
    setSelectedExpense(item);
    setIsDetailVisible(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailVisible(false);
    setSelectedExpense(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: PettyCash }) => <ExpenseRow item={item} onPress={handlePressItem} />,
    [handlePressItem],
  );

  if (isLoading) {
    return <ExpenseListSkeleton />;
  }

  const expenses = data?.content || EMPTY_EXPENSES;

  return (
    <View style={$.container}>
      {expenses.length > 0 && (
        <View style={$.header}>
          {COLUMNS.map((col, index) => (
            <Text key={col.label} style={HEADER_CELL_STYLES[index]}>
              {col.label}
            </Text>
          ))}
        </View>
      )}
      <FlashList<PettyCash>
        contentContainerStyle={expenses.length === 0 ? EMPTY_LIST_CONTAINER_STYLE : $.listContent}
        data={expenses}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ExpenseSeparator}
        ListEmptyComponent={ExpenseEmptyState}
      />

      {!!selectedExpense && (
        <ExpenseDetailModal
          visible={isDetailVisible}
          onClose={handleCloseDetail}
          expense={selectedExpense}
        />
      )}
    </View>
  );
});

const ExpenseSeparator = memo(() => <View style={$.separator} />);

const ExpenseRow = memo(
  ({ item, onPress }: { item: PettyCash; onPress: (item: PettyCash) => void }) => {
    const handlePress = useCallback(() => onPress(item), [onPress, item]);

    return (
      <View style={$.row}>
        {/* Time */}
        <View style={COL_FLEX_STYLES[0]}>
          <Text style={$.timeText}>{formatTime(item.createdAt)}</Text>
          <Text style={$.dateText}>{formatDayDate(item.createdAt)}</Text>
        </View>

        {/* Description */}
        <View style={COL_FLEX_STYLES[1]}>
          <Text style={$.cellText} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        {/* Type */}
        <View style={COL_FLEX_STYLES[2]}>
          <TypeBadge isIncome={item.isIncome} />
        </View>

        {/* Amount */}
        <View style={COL_FLEX_STYLES[3]}>
          <Text style={item.isIncome ? INCOME_AMOUNT_STYLE : EXPENSE_AMOUNT_STYLE}>
            {item.isIncome ? "+ " : "- "}
            {formatCurrency(item.amount)}
          </Text>
        </View>

        {/* Action */}
        <View style={COL_FLEX_STYLES[4]}>
          <Button size="sm" title="Detail" variant="neutral" onPress={handlePress} />
        </View>
      </View>
    );
  },
);

const TypeBadge = memo(({ isIncome }: { isIncome: boolean }) => {
  $.useVariants({ type: isIncome ? "income" : "expense" });

  return (
    <View style={$.badge}>
      <Text style={$.badgeText}>{isIncome ? "Income" : "Expense"}</Text>
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
      type: {
        income: {
          backgroundColor: theme.colors.positive[100],
          borderColor: theme.colors.positive[300],
        },
        expense: {
          backgroundColor: theme.colors.error[100],
          borderColor: theme.colors.error[300],
        },
      },
    },
  },
  badgeText: {
    ...theme.typography.labelSm,
    variants: {
      type: {
        income: {
          color: theme.colors.positive[500],
        },
        expense: {
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
const INCOME_AMOUNT_STYLE = [$.cellText, { color: "green" } as const];
const EXPENSE_AMOUNT_STYLE = [$.cellText, { color: "red" } as const];

export default ExpenseList;
