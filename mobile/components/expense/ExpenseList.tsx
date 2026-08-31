import { type FlashListProps, FlashList as ShopifyFlashList } from "@shopify/flash-list";
import { memo, type ReactElement, useState } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ExpenseDetailModal from "@/components/expense/ExpenseDetailModal";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { t } from "@/services/i18n";
import { usePettyCashQuery } from "@/services/queries/usePettyCashQuery";
import type { PettyCash } from "@/services/types/PettyCash";
import { formatDayDate, formatTime } from "@/utils/Date";
import { formatCurrency } from "@/utils/Format";

// Workaround for missing estimatedItemSize in FlashList props type definition
const FlashList = ShopifyFlashList as unknown as <T>(
  props: FlashListProps<T> & { estimatedItemSize: number },
) => ReactElement;

const COLUMNS = [
  { label: "Time", flex: 1 },
  { label: "Description", flex: 2 },
  { label: "Type", flex: 1 },
  { label: "Amount", flex: 1.5 },
  { label: "Action", flex: 1 },
];

interface ExpenseListProps {
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

const ExpenseList = ({ startDate, endDate, searchQuery }: ExpenseListProps) => {
  const { data, isLoading } = usePettyCashQuery({
    startDate,
    endDate,
    page: 0,
    size: 20,
    sortBy: "createdAt",
    sortDir: "desc",
    keyword: searchQuery,
  });

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

  const renderSkeleton = () => (
    <View style={$.container}>
      <View style={$.header}>
        {COLUMNS.map((col) => (
          <Skeleton key={col.label} style={{ flex: col.flex, marginRight: 10 }} height={20} />
        ))}
      </View>
      <View style={$.listContent}>
        {SKELETON_ROWS.map((rowKey) => (
          <View key={rowKey} style={$.row}>
            {COLUMNS.map((col) => (
              <Skeleton
                key={`${rowKey}-${col.label}`}
                style={{ flex: col.flex, marginRight: 10 }}
                height={20}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );

  const [selectedExpense, setSelectedExpense] = useState<PettyCash | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  const handlePressItem = (item: PettyCash) => {
    setSelectedExpense(item);
    setIsDetailVisible(true);
  };

  const handleCloseDetail = () => {
    setIsDetailVisible(false);
    setSelectedExpense(null);
  };

  if (isLoading) {
    return renderSkeleton();
  }

  return (
    <View style={$.container}>
      {data?.content && data.content.length > 0 && (
        <View style={$.header}>
          {COLUMNS.map((col) => (
            <Text key={col.label} style={[$.headerText, { flex: col.flex }]}>
              {col.label}
            </Text>
          ))}
        </View>
      )}
      <FlashList<PettyCash>
        contentContainerStyle={[
          $.listContent,
          (!data?.content || data.content.length === 0) && { flex: 1 },
        ]}
        data={data?.content || []}
        estimatedItemSize={60}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExpenseRow item={item} onPress={() => handlePressItem(item)} />}
        ItemSeparatorComponent={ExpenseSeparator}
        ListEmptyComponent={
          <EmptyState
            title={t("empty_expenses_title")}
            subtitle={t("empty_expenses_date_subtitle")}
          />
        }
      />

      <ExpenseDetailModal
        visible={isDetailVisible}
        onClose={handleCloseDetail}
        expense={selectedExpense}
      />
    </View>
  );
};

const ExpenseSeparator = () => <View style={$.separator} />;

const ExpenseRow = memo(({ item, onPress }: { item: PettyCash; onPress: () => void }) => {
  // Import TouchableOpacity if not present, but I can use View with onStartShouldSetResponder which is messier.
  // Better to use Pressable or TouchableOpacity.
  // I need to import TouchableOpacity at top.
  return (
    <View style={$.row}>
      {/* Time */}
      <View style={{ flex: COLUMNS[0].flex }}>
        <Text style={$.timeText}>{formatTime(item.createdAt)}</Text>
        <Text style={$.dateText}>{formatDayDate(item.createdAt)}</Text>
      </View>

      {/* Description */}
      <View style={{ flex: COLUMNS[1].flex }}>
        <Text style={$.cellText} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      {/* Type */}
      <View style={{ flex: COLUMNS[2].flex }}>
        <TypeBadge isIncome={item.isIncome} />
      </View>

      {/* Amount */}
      <View style={{ flex: COLUMNS[3].flex }}>
        <Text
          style={[
            $.cellText,
            {
              color: item.isIncome ? "green" : "red",
            },
          ]}
        >
          {item.isIncome ? "+ " : "- "}
          {formatCurrency(item.amount)}
        </Text>
      </View>

      {/* Action */}
      <View style={{ flex: COLUMNS[4].flex }}>
        <Button size="sm" title="Detail" variant="neutral" onPress={onPress} />
      </View>
    </View>
  );
});

const TypeBadge = ({ isIncome }: { isIncome: boolean }) => {
  $.useVariants({ type: isIncome ? "income" : "expense" });

  return (
    <View style={$.badge}>
      <Text style={$.badgeText}>{isIncome ? "Income" : "Expense"}</Text>
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

export default ExpenseList;
