import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Header from "@/components/dashboard/Header";
import DateRangeModal from "@/components/report/DateRangeModal";
import ReportList from "@/components/report/ReportList";
import ReportSummary from "@/components/report/ReportSummary";
import Button from "@/components/ui/Button";
import { t } from "@/services/i18n";
import { useReportsQuery } from "@/services/queries/useReportsQuery";
import { useAuthStore } from "@/store/useAuthStore";
import { type Dayjs, formatApiDate, formatDateRange, toDayjs } from "@/utils/Date";

const renderCalendarIcon = (size: number, color: string) => (
  <Feather name="calendar" size={size} color={color} />
);

const renderDownloadIcon = (size: number, color: string) => (
  <Feather name="download" size={size} color={color} />
);

const ReportScreen = () => {
  const user = useAuthStore((state) => state.user);

  // Default to last 7 days
  const [dateRange, setDateRange] = useState<{ startDate: Dayjs; endDate: Dayjs }>({
    startDate: toDayjs().subtract(6, "day"),
    endDate: toDayjs(),
  });

  const [showPicker, setShowPicker] = useState(false);
  const [includeCogs, setIncludeCogs] = useState(false);

  const { data: reportData, isLoading } = useReportsQuery({
    startDate: formatApiDate(dateRange.startDate),
    endDate: formatApiDate(dateRange.endDate),
  });

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
          variant={includeCogs ? "primary" : "secondary"}
          title={includeCogs ? "COGS: ON" : "COGS: OFF"}
          onPress={() => setIncludeCogs(!includeCogs)}
          size="sm"
        />
        <Button title={t("export")} variant="primary" leftIcon={renderDownloadIcon} size="sm" />
      </Header>

      <DateRangeModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onApply={(start, end) => setDateRange({ startDate: toDayjs(start), endDate: toDayjs(end) })}
        initialStart={dateRange.startDate}
        initialEnd={dateRange.endDate}
        minDate={user?.createdAt}
      />

      {/* Report Summary Section */}
      {reportData?.summary && (
        <ReportSummary summary={reportData.summary} includeCogs={includeCogs} />
      )}

      <View style={$.content}>
        <ReportList data={reportData?.dailyReports || []} isLoading={isLoading} />
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
  },
}));

export default ReportScreen;
