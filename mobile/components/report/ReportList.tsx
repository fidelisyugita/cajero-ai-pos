import { FlashList as ShopifyFlashList, type ListRenderItemInfo, type FlashListProps } from "@shopify/flash-list";
import React from 'react';

import Animated from "react-native-reanimated";
import { type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";

// Workaround for missing estimatedItemSize in FlashList props type definition
const FlashList = ShopifyFlashList as unknown as <T>(
    props: FlashListProps<T> & { estimatedItemSize: number }
) => React.ReactElement;

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

import dayjs from "dayjs";
import { memo } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useRouter } from "expo-router";
import { t } from '@/services/i18n';
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import type { DailyReport } from "@/services/types/Report";
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

const ReportList = ({ data, isLoading, onScroll }: ReportListProps) => {
    const renderSkeleton = () => (
        <View style={$.container}>
            <View style={$.header}>
                {COLUMNS.map((col) => (
                    <Skeleton
                        key={col.label}
                        style={{ flex: col.flex, marginRight: 10 }}
                        height={20}
                    />
                ))}
            </View>
            <View style={$.listContent}>
                {[...Array(10)].map((_, index) => (
                    <View key={index} style={$.row}>
                        {COLUMNS.map((col, cIndex) => (
                            <Skeleton
                                key={cIndex}
                                style={{ flex: col.flex, marginRight: 10 }}
                                height={20}
                            />
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );

    if (isLoading) {
        return renderSkeleton();
    }

    return (
        <View style={$.container}>
            {data && data.length > 0 && (
                <View style={$.header}>
                    {COLUMNS.map((col) => (
                        <Text key={col.label} style={[$.headerText, { flex: col.flex }]}>
                            {col.label}
                        </Text>
                    ))}
                </View>
            )}
            <AnimatedFlashList
                contentContainerStyle={[$.listContent, (!data || data.length === 0) && { flex: 1 }]}
                data={data || []}
                estimatedItemSize={60}
                keyExtractor={(item: any) => item.date}
                renderItem={({ item }: { item: any }) => <ReportRow item={item} />}
                ItemSeparatorComponent={() => <View style={$.separator} />}
                ListEmptyComponent={
                    <EmptyState
                        title={t("empty_reports_title")}
                        subtitle={t("empty_reports_date_subtitle")}
                    />
                }
                onScroll={onScroll}
                scrollEventThrottle={16}
            />
        </View>
    );
};

const ReportRow = memo(({ item }: { item: DailyReport }) => {
    const router = useRouter();
    return (
        <View style={$.row}>
            {/* Time */}
            <View style={{ flex: COLUMNS[0].flex }}>
                <Text style={$.timeText}>{dayjs(item.date).format("dddd")}</Text>
                <Text style={$.dateText}>{dayjs(item.date).format("DD MMM YYYY")}</Text>
            </View>

            {/* Transactions */}
            <View style={{ flex: COLUMNS[1].flex }}>
                <Text style={$.cellText}>
                    {item.totalTransaction}
                </Text>
            </View>

            {/* Product Sales */}
            <View style={{ flex: COLUMNS[2].flex }}>
                <Text style={$.cellText}>
                    {item.totalProductSold}
                </Text>
            </View>

            {/* Revenue */}
            <View style={{ flex: COLUMNS[3].flex }}>
                <Text style={[$.cellText, { color: "green" }]}>
                    {formatCurrency(item.totalRevenue)}
                </Text>
            </View>

            {/* Refund */}
            <View style={{ flex: COLUMNS[4].flex }}>
                <Text style={[$.cellText, { color: "red" }]}>
                    {formatCurrency(item.totalRefund)}
                </Text>
            </View>

            {/* Net Revenue */}
            <View style={{ flex: COLUMNS[5].flex }}>
                <Text style={[$.cellText, { fontWeight: "bold" }]}>
                    {formatCurrency(item.totalNetRevenue)}
                </Text>
            </View>

            {/* Action */}
            <View style={{ flex: COLUMNS[6].flex }}>
                <Button
                    size="sm"
                    title={t("detail")}
                    variant="neutral"
                    onPress={() => router.push({
                        pathname: "/report/detail",
                        params: { report: JSON.stringify(item) }
                    })}
                />
            </View>
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

export default ReportList;
