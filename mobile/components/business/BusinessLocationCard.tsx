import React from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import FormSectionCard from "@/components/ui/FormSectionCard";
import Text from "@/components/ui/Typography";
import IconButton from "@/components/ui/IconButton";
import IcEdit from "@/assets/icons/edit.svg";

import Skeleton from "@/components/ui/Skeleton";

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
			<FormSectionCard title="Location">
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
							<InfoRow label="Street" value={street} />
							<InfoRow label="City" value={city} />
							<InfoRow label="Country" value={country} />
							<InfoRow label="Postal Code" value={postalCode} />
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
