import { Feather } from "@expo/vector-icons";
import { useState } from "react";
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

const ReceiptScreen = () => {
  const [activeTab, setActiveTab] = useState<"Transactions" | "Drafts">("Transactions");
  const user = useAuthStore((state) => state.user);

  // Default to last 7 days
  const [dateRange, setDateRange] = useState<{ startDate: Dayjs; endDate: Dayjs }>({
    startDate: toDayjs().subtract(6, "day"),
    endDate: toDayjs(),
  });

  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View style={$.container}>
      <Header>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${activeTab}`}
        />
        <SegmentedControl
          options={[
            { label: t("transactions"), value: "Transactions" },
            { label: t("drafts"), value: "Drafts" },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "Transactions" && (
          <Button
            variant="secondary"
            title={formatDateRange(dateRange.startDate, dateRange.endDate)}
            rightIcon={renderCalendarIcon}
            onPress={() => setShowPicker(true)}
            size="sm"
          />
        )}
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
        {activeTab === "Transactions" ? (
          <ReceiptsList
            startDate={formatApiDate(dateRange.startDate)}
            endDate={formatApiDate(dateRange.endDate)}
            searchQuery={searchQuery}
          />
        ) : (
          <DraftList searchQuery={searchQuery} />
        )}
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

export default ReceiptScreen;
