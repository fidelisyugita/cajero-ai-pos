import React from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import FormSectionCard from "@/components/ui/FormSectionCard";
import Text from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import EmployeeItem, { type Employee } from "./EmployeeItem";
import { vs } from "@/utils/Scale";
import Skeleton from "@/components/ui/Skeleton";
import IcPlus from "@/assets/icons/plus.svg";
import { t } from "@/services/i18n";
import EmptyState from "@/components/ui/EmptyState";

interface EmployeeListCardProps {
	employees: Employee[];
	onAddEmployee: () => void;
	loading?: boolean;
}

const EmployeeListCard = ({
	employees,
	onAddEmployee,
	loading,
}: EmployeeListCardProps) => {
	// Custom container instead of FormSectionCard because header is different
	return (
		<View style={$.container}>
			{loading ? (
				<Skeleton width="100%" height={200} borderRadius={16} />
			) : (
				<FormSectionCard
					title={t("management_employee")}
				// headerRight={
				// 	!loading && (
				// 		<Button
				// 			title={t("add_employee")}
				// 			variant="primary"
				// 			size="sm"
				// 			leftIcon={(size, color) => (
				// 				<IcPlus width={size} height={size} color={color} />
				// 			)}
				// 			onPress={onAddEmployee}
				// 		/>
				// 	)
				// }
				>
					<View style={$.list}>
						{employees.length === 0 ? (
							<EmptyState
								title={t("empty_employees_title")}
								subtitle={t("empty_employees_subtitle")}
								style={{ paddingBottom: 0, marginBottom: -vs(20) }}
							/>
						) : (
							employees.map((employee) => (
								<EmployeeItem
									key={employee.id}
									employee={employee}
									onPressDetails={() => console.log("Details", employee.id)}
								/>
							))
						)}
						{!loading && (
							<Button
								title={t("add_employee")}
								variant="primary"
								size="sm"
								leftIcon={(size, color) => (
									<IcPlus width={size} height={size} color={color} />
								)}
								style={{ width: vs(150), alignSelf: 'center', marginTop: vs(10) }}
								onPress={onAddEmployee}
							/>
						)}
					</View>
				</FormSectionCard>
			)}
		</View>
	);
};

const $ = StyleSheet.create((theme) => ({
	container: {
		flex: 1,
	},
	list: {
		gap: theme.spacing.md,
	},
}));

export default EmployeeListCard;
