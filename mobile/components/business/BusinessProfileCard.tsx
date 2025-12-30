import React from "react";
import { View, Image } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import FormSectionCard from "@/components/ui/FormSectionCard";
import Text from "@/components/ui/Typography";
import IconButton from "@/components/ui/IconButton";
import IcEdit from "@/assets/icons/edit.svg";
import Skeleton from "@/components/ui/Skeleton";
import { vs } from "@/utils/Scale";
import { Location } from "@/services/types/Store";

interface BusinessProfileCardProps {
	name: string;
	phone: string;
	website: string;
	imageUrl?: string;
	description: string;
	location: Location | undefined;
	loading?: boolean;
}

const BusinessProfileCard = ({
	name,
	phone,
	website,
	imageUrl,
	description,
	location,
	loading,
	onEdit,
}: BusinessProfileCardProps & { onEdit?: () => void }) => {
	return (
		<View style={$.container}>
			<FormSectionCard title="Profile">
				{!loading && (
					<View style={$.editButton}>
						<IconButton
							Icon={IcEdit}
							variant="neutral-no-stroke"
							onPress={() => {
								console.log("Edit Icon Pressed inside Card");
								onEdit?.();
							}}
						/>
					</View>
				)}
				<View style={$.content}>
					<View style={$.logoContainer}>
						{loading ? (
							<Skeleton width={vs(100)} height={vs(100)} borderRadius={vs(50)} />
						) : (
							<Image
								source={{ uri: imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}` }}
								style={$.logo}
							/>
						)}
					</View>

					{loading ? (
						<Skeleton width="60%" height={24} />
					) : (
						<Text variant="headingMd" align="center">
							{name}
						</Text>
					)}

					<View style={$.contactInfo}>
						{loading ? (
							<>
								<Skeleton width="40%" height={16} />
								<Skeleton width="50%" height={16} />
							</>
						) : (
							<>
								<Text align="center">{phone}</Text>
								<Text align="center" color="#B91C1C">
									{website}
								</Text>
							</>
						)}
					</View>

					{loading ? (
						<Skeleton width="80%" height={40} />
					) : (
						<Text align="center" color="#4B5563">
							{description}
						</Text>
					)}
					{loading ? (
						<Skeleton width="80%" height={40} />
					) : (
						<Text align="center" color="#4B5563">
							{location?.street || "-"}/{location?.city || "-"}/{location?.country || "-"}/{location?.postalCode || "-"}
						</Text>
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
		alignItems: "center",
		gap: theme.spacing.md,
	},
	logoContainer: {
		marginBottom: theme.spacing.sm,
	},
	logo: {
		width: vs(100),
		height: vs(100),
		borderRadius: vs(50),
	},
	contactInfo: {
		gap: theme.spacing.xs,
	},
}));

export default BusinessProfileCard;
