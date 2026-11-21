import Feather from "@expo/vector-icons/Feather";
import { memo } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ReportSummary as ReportSummaryType } from "@/services/types/Report";
import { formatCurrency } from "@/utils/Format";

const REPEAT_ICON = <Feather name="repeat" size={24} color="#A05E5E" />;
const PACKAGE_ICON = <Feather name="package" size={24} color="#A05E5E" />;
const DOLLAR_SIGN_ICON = <Feather name="dollar-sign" size={24} color="#A05E5E" />;
const REFRESH_CCW_ICON = <Feather name="refresh-ccw" size={24} color="#A05E5E" />;
const SHOPPING_CART_ICON = <Feather name="shopping-cart" size={24} color="#A05E5E" />;
const PIE_CHART_ICON = <Feather name="pie-chart" size={24} color="#A05E5E" />;

interface ReportSummaryProps {
  summary: ReportSummaryType;
  includeCogs?: boolean;
}

const ReportSummary = memo(({ summary, includeCogs = false }: ReportSummaryProps) => {
  // Calculate adjusted net revenue when COGS is included
  const adjustedNetRevenue = includeCogs
    ? summary.totalNetRevenue - (summary.totalCogs || 0)
    : summary.totalNetRevenue;

  return (
    <View style={$.container}>
      <View style={$.cardsContainer}>
        {/* Total Transaction */}
        <SummaryCard
          label="Total Transaction"
          value={summary.totalTransaction.toString()}
          icon={REPEAT_ICON}
        />

        {/* Total Item Sold */}
        <SummaryCard
          label="Total Item Sold"
          value={summary.totalProductSold.toString()}
          icon={PACKAGE_ICON}
        />

        {/* Total Revenue */}
        <SummaryCard
          label="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={DOLLAR_SIGN_ICON}
        />

        {/* Total Refund */}
        <SummaryCard
          label="Total Refund"
          value={formatCurrency(summary.totalRefund)}
          icon={REFRESH_CCW_ICON}
        />

        {/* Total COGS - Only show when data is available */}
        {summary.totalCogs != null && summary.totalCogs > 0 && (
          <SummaryCard
            label="Total COGS"
            value={formatCurrency(summary.totalCogs)}
            icon={SHOPPING_CART_ICON}
          />
        )}

        {/* Total Net Revenue - Use adjusted value when COGS is included */}
        <SummaryCard
          label={includeCogs ? "Net Revenue (w/ COGS)" : "Total Net Revenue"}
          value={formatCurrency(adjustedNetRevenue)}
          icon={PIE_CHART_ICON}
        />
      </View>
    </View>
  );
});

export const SummaryCard = memo(
  ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => {
    return (
      <View style={$.card}>
        <View style={$.cardHeader}>
          {icon}
          <Text style={$.cardLabel}>{label}</Text>
        </View>
        <Text style={$.cardValue}>{value}</Text>
        {/* Decorative circle/shape can be added here if needed to match exact design */}
        <View style={$.decorativeCircle} />
      </View>
    );
  },
);

const $ = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.xl,
    width: "100%",
  },
  cardsContainer: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFF8F0", // Peach/Light Orange background
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "#FFE4E1",
    position: "relative",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  cardLabel: {
    ...theme.typography.bodySm,
    color: theme.colors.neutral[700],
  },
  cardValue: {
    ...theme.typography.heading4, // Changed from headingSm
    color: theme.colors.neutral[700], // Changed from 900 to 700
    fontWeight: "bold",
  },
  actionContainer: {
    // No specific layout needed as it's a flex item now
  },
  decorativeCircle: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFC0CB", // Pinkish overlay
    opacity: 0.5,
    zIndex: -1,
  },
}));

export default ReportSummary;
