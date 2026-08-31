import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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

const ExpenseScreen = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // Default to last 7 days
  const [dateRange, setDateRange] = useState<{ startDate: Dayjs; endDate: Dayjs }>({
    startDate: toDayjs().subtract(6, "day"),
    endDate: toDayjs(),
  });

  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={$.container}>
      <Header>
        <Button
          variant="secondary"
          title={formatDateRange(dateRange.startDate, dateRange.endDate)}
          rightIcon={renderCalendarIcon}
          onPress={() => setShowPicker(true)}
          size="sm"
        />
        <Button
          onPress={() => router.push("/expense/add")}
          size="sm"
          title={t("add_expense_title")}
          variant="primary"
          leftIcon={renderPlusIcon}
        />
      </Header>

      <DateRangeModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onApply={(start, end) => setDateRange({ startDate: toDayjs(start), endDate: toDayjs(end) })}
        initialStart={dateRange.startDate}
        initialEnd={dateRange.endDate}
        minDate={user?.createdAt}
      />

      <View style={$.content}>
        <ExpenseList
          startDate={formatApiDate(dateRange.startDate)}
          endDate={formatApiDate(dateRange.endDate)}
        />
      </View>
    </View>
  );
};

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
