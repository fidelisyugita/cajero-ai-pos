import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { t } from "@/services/i18n";
import type { ReportSummary as ReportSummaryType } from "@/services/types/Report";
import { formatCurrency } from "@/utils/Format";

interface ReportSummaryProps {
  summary: ReportSummaryType;
  includeCogs?: boolean;
}

const ReportSummary = ({ summary, includeCogs = false }: ReportSummaryProps) => {
  // Calculate adjusted net revenue when COGS is included
  const adjustedNetRevenue = includeCogs
    ? summary.totalNetRevenue - (summary.totalCogs || 0)
    : summary.totalNetRevenue;

  return (
    <View style={$.container}>
      <View style={$.cardsContainer}>
        {/* Total Transaction */}
        <SummaryCard
          label={t("total_transaction")}
          value={summary.totalTransaction.toString()}
          icon={<Feather name="repeat" size={24} color="#A05E5E" />}
        />

        {/* Total Item Sold */}
        <SummaryCard
          label={t("total_item_sold")}
          value={summary.totalProductSold.toString()}
          icon={<Feather name="package" size={24} color="#A05E5E" />}
        />

        {/* Total Revenue */}
        <SummaryCard
          label={t("total_revenue")}
          value={formatCurrency(summary.totalRevenue)}
          icon={<Feather name="dollar-sign" size={24} color="#A05E5E" />}
        />

        {/* Total Refund */}
        <SummaryCard
          label={t("total_refund")}
          value={formatCurrency(summary.totalRefund)}
          icon={<Feather name="refresh-ccw" size={24} color="#A05E5E" />}
        />

        {/* Total COGS - Only show when data is available */}
        {summary.totalCogs != null && summary.totalCogs > 0 && (
          <SummaryCard
            label={t("total_cogs")}
            value={formatCurrency(summary.totalCogs)}
            icon={<Feather name="shopping-cart" size={24} color="#A05E5E" />}
          />
        )}

        {/* Total Net Revenue - Use adjusted value when COGS is included */}
        <SummaryCard
          label={includeCogs ? t("net_revenue_with_cogs") : t("total_net_revenue")}
          value={formatCurrency(adjustedNetRevenue)}
          icon={<Feather name="pie-chart" size={24} color="#A05E5E" />}
        />
      </View>
    </View>
  );
};

export const SummaryCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => {
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
};

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
