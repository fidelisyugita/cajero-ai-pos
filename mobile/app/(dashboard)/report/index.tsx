import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Header from "@/components/dashboard/Header";
import DateRangeModal from "@/components/report/DateRangeModal";
import ReportList from "@/components/report/ReportList";
import ReportSummary from "@/components/report/ReportSummary";
import Button from "@/components/ui/Button";
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

  // const scrollY = useSharedValue(0);

  // const scrollHandler = useAnimatedScrollHandler((event) => {
  //     scrollY.value = event.contentOffset.y;
  // });

  // const summaryStyle = useAnimatedStyle(() => {
  //     return {
  //         height: interpolate(scrollY.value, [0, 100], [130, 0], Extrapolation.CLAMP),
  //         opacity: interpolate(scrollY.value, [0, 50], [1, 0], Extrapolation.CLAMP),
  //         transform: [
  //             { translateY: interpolate(scrollY.value, [0, 100], [0, -20], Extrapolation.CLAMP) }
  //         ],
  //         overflow: 'hidden',
  //     };
  // });

  return (
    <View style={$.container}>
      <Header>
        {/* <Text style={$.headerTitle}>Report</Text> */}
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
        <Button title="Export" variant="primary" leftIcon={renderDownloadIcon} size="sm" />
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
        // <Animated.View style={summaryStyle}>
        <ReportSummary summary={reportData.summary} includeCogs={includeCogs} />
        // </Animated.View>
      )}

      <View style={$.content}>
        <ReportList
          data={reportData?.dailyReports || []}
          isLoading={isLoading}
          // onScroll={scrollHandler}
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
  headerTitle: {
    ...theme.typography.heading3,
    color: theme.colors.neutral[700],
    marginRight: theme.spacing.xl,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    // paddingTop: 0,
    // marginTop: -theme.spacing.md,
  },
}));

export default ReportScreen;
