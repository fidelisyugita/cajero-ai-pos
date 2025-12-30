import React from "react";
import { View, Image } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { t } from '@/services/i18n';
import FormSectionCard from "@/components/ui/FormSectionCard";
import Text from "@/components/ui/Typography";
import IcEdit from "@/assets/icons/edit.svg";
import IconButton from "@/components/ui/IconButton";
import Skeleton from "@/components/ui/Skeleton";
import { vs } from "@/utils/Scale";

interface OwnerInfoCardProps {
	name: string;
	role: string;
	email: string;
	avatar?: string;
	loading?: boolean;
}

const OwnerInfoCard = ({
	name,
	role,
	email,
	avatar,
	loading,
	onEdit,
}: OwnerInfoCardProps & { onEdit?: () => void }) => {
	return (
		<View style={$.container}>
			<FormSectionCard title={t("profile_information")}>
				{!loading && onEdit && (
					<View style={$.editButton}>
						<IconButton Icon={IcEdit} variant="neutral-no-stroke" onPress={onEdit} />
					</View>
				)}
				<View style={$.content}>
					{loading ? (
						<Skeleton width={vs(60)} height={vs(60)} borderRadius={vs(30)} />
					) : (
						<Image
							source={{ uri: avatar }}
							style={$.avatar}
						/>
					)}

					<View style={$.info}>
						{loading ? (
							<>
								<Skeleton width={120} height={20} />
								<Skeleton width={80} height={16} />
								<Skeleton width={150} height={16} />
							</>
						) : (
							<>
								<Text variant="headingSm">{name}</Text>
								<Text color="#B91C1C">{role}</Text>
								<Text color="#4B5563">{email}</Text>
							</>
						)}
					</View>
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
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.md,
	},
	avatar: {
		width: vs(60),
		height: vs(60),
		borderRadius: vs(30),
		backgroundColor: theme.colors.primary[300],
	},
	info: {
		gap: theme.spacing.xs,
	},
}));

export default OwnerInfoCard;
