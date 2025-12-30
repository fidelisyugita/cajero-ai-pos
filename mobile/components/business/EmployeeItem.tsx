import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Text from "@/components/ui/Typography";
import { vs } from "@/utils/Scale";
import { Ionicons } from "@expo/vector-icons";

export interface Employee {
	id: string;
	name: string;
	role: string;
	email: string;
	status: "Active" | "Inactive";
	avatar?: string;
}

interface EmployeeItemProps {
	employee: Employee;
	onPressDetails: () => void;
}

const EmployeeItem = ({ employee, onPressDetails }: EmployeeItemProps) => {
	console.log(employee?.avatar);

	return (
		<View style={$.container}>
			<View style={$.row}>
				<Image
					source={{
						uri: employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}`,
					}}
					style={$.avatar}
				/>
				<View style={$.info}>
					<View style={$.headerRow}>
						<Text variant="headingSm">{employee.name}</Text>
						<View
							style={[
								$.statusBadge,
								employee.status === "Active" ? $.activeBadge : $.inactiveBadge,
							]}
						>
							<Text
								variant="caption"
								style={
									employee.status === "Active"
										? $.activeText
										: $.inactiveText
								}
							>
								{employee.status}
							</Text>
						</View>
					</View>

					<Text color="#B91C1C">{employee.role}</Text>
					<Text color="#4B5563">{employee.email}</Text>

					<TouchableOpacity onPress={onPressDetails} style={$.detailsLink}>
						<Text variant="caption" color="#4B5563">
							Details
						</Text>
						<Ionicons name="arrow-forward" size={12} color="#4B5563" />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

const $ = StyleSheet.create((theme) => ({
	container: {
		padding: theme.spacing.md,
		backgroundColor: theme.colors.primary[100], // Light background
		borderRadius: theme.radius.lg,
		borderWidth: 1,
		borderColor: theme.colors.primary[200],
	},
	row: {
		flexDirection: "row",
		gap: theme.spacing.md,
	},
	avatar: {
		width: vs(60),
		height: vs(60),
		borderRadius: vs(30),
		backgroundColor: theme.colors.primary[300],
	},
	info: {
		flex: 1,
		gap: theme.spacing.xs,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	statusBadge: {
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs / 2,
		borderRadius: theme.radius.sm,
		borderWidth: 1,
	},
	activeBadge: {
		backgroundColor: "#ECFDF5",
		borderColor: "#10B981",
	},
	inactiveBadge: {
		backgroundColor: "#FEF2F2",
		borderColor: "#EF4444",
	},
	activeText: {
		color: "#059669",
	},
	inactiveText: {
		color: "#B91C1C",
	},
	detailsLink: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		gap: 4,
		marginTop: theme.spacing.xs,
	},
}));

export default EmployeeItem;
