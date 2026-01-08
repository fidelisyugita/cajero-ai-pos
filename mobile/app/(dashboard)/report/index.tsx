import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Header from "@/components/dashboard/Header";
import ReportList from "@/components/report/ReportList";
import { useReportsQuery } from "@/services/queries/useReportsQuery";
import dayjs from "dayjs";
import { useState } from "react";
import Button from "@/components/ui/Button";
import DateRangeModal from "@/components/report/DateRangeModal";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "@/store/useAuthStore";
import ReportSummary from "@/components/report/ReportSummary";
import Text from "@/components/ui/Typography";

import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming, interpolate, Extrapolation } from "react-native-reanimated";

const ReportScreen = () => {
    const user = useAuthStore((state) => state.user);

    // Default to last 7 days
    const [dateRange, setDateRange] = useState({
        startDate: dayjs().subtract(6, 'day').toDate(),
        endDate: dayjs().toDate(),
    });

    const [showPicker, setShowPicker] = useState(false);

    const { data: reportData, isLoading } = useReportsQuery({
        startDate: dayjs(dateRange.startDate).format('YYYY-MM-DD'),
        endDate: dayjs(dateRange.endDate).format('YYYY-MM-DD'),
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
                    title={`${dayjs(dateRange.startDate).format("DD/MM/YYYY")} - ${dayjs(dateRange.endDate).format("DD/MM/YYYY")}`}
                    rightIcon={(size, color) => <Feather name="calendar" size={size} color={color} />}
                    onPress={() => setShowPicker(true)}
                    size="sm"
                />
                <Button
                    title="Export"
                    variant="primary"
                    leftIcon={(size, color) => <Feather name="download" size={size} color={color} />}
                    size="sm"
                />
            </Header>

            <DateRangeModal
                visible={showPicker}
                onClose={() => setShowPicker(false)}
                onApply={(start, end) => setDateRange({ startDate: start, endDate: end })}
                initialStart={dateRange.startDate}
                initialEnd={dateRange.endDate}
                minDate={user?.createdAt ? new Date(user.createdAt) : undefined}
            />

            {/* Report Summary Section */}
            {reportData?.summary && (
                // <Animated.View style={summaryStyle}>
                <ReportSummary summary={reportData.summary} />
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
