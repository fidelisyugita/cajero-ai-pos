import Feather from "@expo/vector-icons/Feather";
import { memo, useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Header from "@/components/dashboard/Header";
import DraftList from "@/components/receipt/DraftList";
import ReceiptsList from "@/components/receipt/ReceiptsList";
import DateRangeModal from "@/components/report/DateRangeModal";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/ui/SearchBar";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { t } from "@/services/i18n";
import { useAuthStore } from "@/store/useAuthStore";
import { type Dayjs, formatApiDate, formatDateRange, toDayjs } from "@/utils/Date";

const renderCalendarIcon = (size: number, color: string) => (
  <Feather name="calendar" size={size} color={color} />
);

const SEGMENTED_OPTIONS: { label: string; value: "Transactions" | "Drafts" }[] = [
  { label: t("transactions"), value: "Transactions" },
  { label: t("drafts"), value: "Drafts" },
];

const ReceiptScreen = memo(() => {
  const [activeTab, setActiveTab] = useState<"Transactions" | "Drafts">("Transactions");
  const user = useAuthStore((state) => state.user);

  // Default to last 7 days
  const [dateRange, setDateRange] = useState<{ startDate: Dayjs; endDate: Dayjs }>(() => ({
    startDate: toDayjs().subtract(6, "day"),
    endDate: toDayjs(),
  }));

  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dateRangeTitle = useMemo(
    () => formatDateRange(dateRange.startDate, dateRange.endDate),
    [dateRange.startDate, dateRange.endDate],
  );
  const startDateApi = useMemo(() => formatApiDate(dateRange.startDate), [dateRange.startDate]);
  const endDateApi = useMemo(() => formatApiDate(dateRange.endDate), [dateRange.endDate]);
  const searchPlaceholder = activeTab === "Transactions" ? "Search Transactions" : "Search Drafts";

  const handleOpenPicker = useCallback(() => setShowPicker(true), []);
  const handleClosePicker = useCallback(() => setShowPicker(false), []);
  const handleApplyDateRange = useCallback((start: Date, end: Date) => {
    setDateRange({ startDate: toDayjs(start), endDate: toDayjs(end) });
  }, []);

  const headerChildren = useMemo(
    () => (
      <>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={searchPlaceholder}
        />
        <SegmentedControl options={SEGMENTED_OPTIONS} value={activeTab} onChange={setActiveTab} />

        {activeTab === "Transactions" && (
          <Button
            variant="secondary"
            title={dateRangeTitle}
            rightIcon={renderCalendarIcon}
            onPress={handleOpenPicker}
            size="sm"
          />
        )}
      </>
    ),
    [searchQuery, searchPlaceholder, activeTab, dateRangeTitle, handleOpenPicker],
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
        {activeTab === "Transactions" ? (
          <ReceiptsList startDate={startDateApi} endDate={endDateApi} searchQuery={searchQuery} />
        ) : (
          <DraftList searchQuery={searchQuery} />
        )}
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

export default ReceiptScreen;
