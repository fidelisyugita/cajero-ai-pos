import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { memo, useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Header from "@/components/dashboard/Header";
import ExpenseList from "@/components/expense/ExpenseList";
import DateRangeModal from "@/components/report/DateRangeModal";
import Button from "@/components/ui/Button";
import { t } from "@/services/i18n";
import { useAuthStore } from "@/store/useAuthStore";
import { type Dayjs, formatApiDate, formatDateRange, toDayjs } from "@/utils/Date";

const renderCalendarIcon = (size: number, color: string) => (
  <Feather name="calendar" size={size} color={color} />
);

const renderPlusIcon = (size: number, color: string) => (
  <Feather name="plus" size={size} color={color} />
);

const ExpenseScreen = memo(() => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // Default to last 7 days
  const [dateRange, setDateRange] = useState<{ startDate: Dayjs; endDate: Dayjs }>(() => ({
    startDate: toDayjs().subtract(6, "day"),
    endDate: toDayjs(),
  }));

  const [showPicker, setShowPicker] = useState(false);

  const dateRangeTitle = useMemo(
    () => formatDateRange(dateRange.startDate, dateRange.endDate),
    [dateRange.startDate, dateRange.endDate],
  );
  const startDateApi = useMemo(() => formatApiDate(dateRange.startDate), [dateRange.startDate]);
  const endDateApi = useMemo(() => formatApiDate(dateRange.endDate), [dateRange.endDate]);

  const handleOpenPicker = useCallback(() => setShowPicker(true), []);
  const handleClosePicker = useCallback(() => setShowPicker(false), []);
  const handleApplyDateRange = useCallback((start: Date, end: Date) => {
    setDateRange({ startDate: toDayjs(start), endDate: toDayjs(end) });
  }, []);
  const handleAddExpense = useCallback(() => {
    router.push("/expense/add");
  }, [router]);

  const headerChildren = useMemo(
    () => (
      <>
        <Button
          variant="secondary"
          title={dateRangeTitle}
          rightIcon={renderCalendarIcon}
          onPress={handleOpenPicker}
          size="sm"
        />
        <Button
          onPress={handleAddExpense}
          size="sm"
          title={t("add_expense_title")}
          variant="primary"
          leftIcon={renderPlusIcon}
        />
      </>
    ),
    [dateRangeTitle, handleOpenPicker, handleAddExpense],
  );

  return (
    <View style={$.container}>
      <Header>{headerChildren}</Header>

      {showPicker && (
        <DateRangeModal
          visible={showPicker}
          onClose={handleClosePicker}
          onApply={handleApplyDateRange}
          initialStart={dateRange.startDate}
          initialEnd={dateRange.endDate}
          minDate={user?.createdAt}
        />
      )}

      <View style={$.content}>
        <ExpenseList startDate={startDateApi} endDate={endDateApi} />
      </View>
    </View>
  );
});

const $ = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[200],
  },

  content: {
    flex: 1,
    padding: theme.spacing.xl,
    paddingTop: 0,
  },
}));

export default ExpenseScreen;
