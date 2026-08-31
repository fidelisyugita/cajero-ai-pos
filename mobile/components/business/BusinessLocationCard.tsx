import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcEdit from "@/assets/icons/edit.svg";
import FormSectionCard from "@/components/ui/FormSectionCard";
import IconButton from "@/components/ui/IconButton";
import Skeleton from "@/components/ui/Skeleton";
import Text from "@/components/ui/Typography";
import { t } from "@/services/i18n";

interface BusinessLocationCardProps {
  street: string;
  city: string;
  country: string;
  postalCode: string;
  loading?: boolean;
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={$.infoRow}>
    <Text variant="caption" color="#6B7280">
      {label}
    </Text>
    <Text variant="bodyMd">{value}</Text>
  </View>
);

const BusinessLocationCard = ({
  street,
  city,
  country,
  postalCode,
  loading,
}: BusinessLocationCardProps) => {
  return (
    <View style={$.container}>
      <FormSectionCard title={t("location")}>
        {!loading && (
          <View style={$.editButton}>
            <IconButton Icon={IcEdit} variant="neutral-no-stroke" />
          </View>
        )}
        <View style={$.content}>
          {loading ? (
            <>
              <Skeleton width="100%" height={40} />
              <Skeleton width="100%" height={40} />
              <Skeleton width="100%" height={40} />
              <Skeleton width="100%" height={40} />
            </>
          ) : (
            <>
              <InfoRow label={t("street")} value={street} />
              <InfoRow label={t("city")} value={city} />
              <InfoRow label={t("country")} value={country} />
              <InfoRow label={t("postal_code")} value={postalCode} />
            </>
          )}
        </View>
      </FormSectionCard>
    </View>
  );
};

const $ = StyleSheet.create((theme) => ({
  container: {
    position: "relative",
  },
  editButton: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    zIndex: 1,
  },
  content: {
    gap: theme.spacing.md,
  },
  infoRow: {
    gap: theme.spacing.xs,
  },
}));

export default BusinessLocationCard;
