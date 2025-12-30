import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { t } from "@/services/i18n";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { formatCurrency } from "@/utils/Format";
import dayjs from "dayjs";
import { useState } from "react";
import IcExport from "@/assets/icons/upload.svg"; // Reusing upload icon as export for now or create new
import { type DailyReport } from "@/services/types/Report";
import { SummaryCard } from "@/components/report/ReportSummary";
import { Feather } from "@expo/vector-icons";

const ReportDetailScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parse the report data string back to object
    const report: DailyReport = params.report ? JSON.parse(params.report as string) : null;

    const [selectedCashier, setSelectedCashier] = useState("all");

    if (!report) {
        return (
            <View style={$.container}>
                <Text>Report not found</Text>
            </View>
        );
    }

    return (
        <View style={$.container}>
            <Stack.Screen
                options={{
                    headerShown: false
                }}
            />

            <View style={$.headerWrapper}>
                <ScreenHeader title={t("report_details")} />
            </View>

            <ScrollView contentContainerStyle={$.scrollContent}>
                <View style={$.topSection}>
                    <View>
                        <Text style={$.dateTitle}>{dayjs(report.date).format("dddd, D MMMM YYYY")}</Text>
                        <View style={$.cashierFilter}>
                            {/* Placeholder for cashier filter if needed later */}
                        </View>
                    </View>

                    <View style={$.netRevenueCard}>
                        <SummaryCard
                            label="Total Net Revenue"
                            value={formatCurrency(report.totalNetRevenue)}
                            icon={<Feather name="pie-chart" size={24} color="#A05E5E" />}
                        />
                    </View>
                </View>

                <View style={$.grid}>
                    {/* Sales Card */}
                    <View style={$.card}>
                        <View style={$.cardHeader}>
                            <Text style={$.cardTitle}>{t("sales")}</Text>
                        </View>
                        <View style={$.cardContent}>
                            <Row label={t("total_transaction")} value={(report.totalTransaction || 0).toString()} />
                            <Row label={t("total_item_sold")} value={(report.totalProductSold || 0).toString()} />
                            <Row
                                label={t("total_revenue")}
                                value={formatCurrency(report.totalRevenue)}
                                valueStyle={$.totalValue}
                            />
                            <Row
                                label={t("total_discount")}
                                value={formatCurrency(report.totalDiscount || 0)}
                            />
                        </View>
                    </View>

                    {/* Refund Card */}
                    <View style={$.card}>
                        <View style={$.cardHeader}>
                            <Text style={$.cardTitle}>{t("refund")}</Text>
                        </View>
                        <View style={$.cardContent}>
                            <Row label={t("total_refund_transaction")} value={(report.totalRefundTransaction || 0).toString()} />
                            <Row label={t("total_refund_item")} value={(report.totalRefundProduct || 0).toString()} />
                            <Row
                                label={t("total_amount")}
                                value={formatCurrency(report.totalRefund)}
                                valueStyle={$.totalValue}
                            />
                        </View>
                    </View>

                    {/* Payment Method Card */}
                    <View style={$.card}>
                        <View style={$.cardHeader}>
                            <Text style={$.cardTitle}>{t("payment_method")}</Text>
                        </View>
                        <View style={$.cardContent}>
                            {report.paymentMethods.map((pm) => (
                                <Row
                                    key={pm.paymentMethod}
                                    label={pm.paymentMethod}
                                    value={formatCurrency(pm.totalAmount)}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Tax Card */}
                    <View style={$.card}>
                        <View style={$.cardHeader}>
                            <Text style={$.cardTitle}>{t("tax")}</Text>
                        </View>
                        <View style={$.cardContent}>
                            <Row label={t("total_tax")} value={formatCurrency(report.totalTax)} />
                        </View>
                    </View>

                    {/* Expenses Card */}
                    <View style={$.card}>
                        <View style={$.cardHeader}>
                            <Text style={$.cardTitle}>{t("expenses")}</Text>
                        </View>
                        <View style={$.cardContent}>
                            <Row label={t("total_expenses")} value={formatCurrency(report.totalExpenses)} />
                        </View>
                    </View>

                    {/* Commission Card */}
                    <View style={$.card}>
                        <View style={$.cardHeader}>
                            <Text style={$.cardTitle}>{t("commission")}</Text>
                        </View>
                        <View style={$.cardContent}>
                            {report.commissions.length > 0 ? (
                                report.commissions.map((c) => (
                                    <Row
                                        key={c.cashierName}
                                        label={`Total Commission (${c.cashierName})`}
                                        value={formatCurrency(c.totalCommission)}
                                    />
                                ))
                            ) : (
                                <Row label={t("total_commission")} value={formatCurrency(0)} />
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={$.footer}>
                <Button
                    variant="secondary"
                    title={t("cancel")}
                    onPress={() => router.back()}
                    style={$.footerButton}
                    size="lg"
                />
                <Button
                    variant="primary"
                    title={t("export")}
                    onPress={() => { }}
                    style={[$.footerButton, { backgroundColor: '#7F1D1D' }]} // Dark red from design
                    size="lg"
                // leftIcon={(size, color) => <IcExport width={size} height={size} color={color} />}
                />
            </View>
        </View>
    );
};

const Row = ({ label, value, valueStyle }: { label: string, value: string, valueStyle?: any }) => (
    <View style={$.row}>
        <Text style={$.rowLabel}>{label}</Text>
        <Text style={[$.rowValue, valueStyle]}>{value}</Text>
    </View>
);

const $ = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.neutral[100], // Background seems light beige/off-white in design
    },
    headerWrapper: {
        backgroundColor: theme.colors.neutral[100],
    },
    scrollContent: {
        padding: theme.spacing.xl,
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.xl,
    },
    dateTitle: {
        ...theme.typography.heading3,
        color: theme.colors.neutral[700],
        marginBottom: theme.spacing.md,
    },
    cashierFilter: {
        width: 250,
    },
    netRevenueCard: {
        // backgroundColor: '#FFE4E6', // Removed as SummaryCard handles bg
    },
    totalValue: {
        color: theme.colors.primary[400],
    },
    netRevenueLabel: {
        ...theme.typography.labelSm,
        color: theme.colors.neutral[700],
        marginBottom: theme.spacing.xs,
    },
    netRevenueValue: {
        ...theme.typography.heading3,
        color: '#881337', // Dark red
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: theme.spacing.lg,
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: theme.colors.neutral[100],
        borderRadius: theme.radius.md,
        overflow: 'hidden',
        width: '49%', // Increased to fill more space, gap handled by space-between
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
    },
    cardHeader: {
        backgroundColor: theme.colors.sup.red,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral[200],
    },
    cardTitle: {
        ...theme.typography.heading5,
        color: theme.colors.neutral[700],
    },
    cardContent: {
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
        backgroundColor: theme.colors.neutral[100],
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowLabel: {
        ...theme.typography.bodyMd,
        color: theme.colors.neutral[600],
    },
    rowValue: {
        ...theme.typography.heading5,
        color: theme.colors.neutral[700],
    },
    footer: {
        flexDirection: 'row',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.neutral[100],
        borderTopWidth: 1,
        borderTopColor: theme.colors.neutral[200],
        gap: theme.spacing.md,
    },
    footerButton: {
        flex: 1,
    },
}));

export default ReportDetailScreen;
