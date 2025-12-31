import { View, ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useRouter } from "expo-router";
import Text from "@/components/ui/Typography";
import BusinessProfileCard from "@/components/business/BusinessProfileCard";
import BusinessLocationCard from "@/components/business/BusinessLocationCard";
import OwnerInfoCard from "@/components/business/OwnerInfoCard";
import EmployeeListCard from "@/components/business/EmployeeListCard";
import { vs } from "@/utils/Scale";
import type { Employee } from "@/components/business/EmployeeItem";
import Header from "../../../components/dashboard/Header";
import { useStoreQuery } from "@/services/queries/useStoreQuery";
import { useAuthStore } from "@/store/useAuthStore";
import { useUsersQuery } from "@/services/queries/useUsersQuery";
import { t } from '@/services/i18n';

import Logger from "@/services/logger";



const BusinessScreen = () => {
	const router = useRouter();
	const { user } = useAuthStore();
	const { data: store, isLoading: isStoreLoading } = useStoreQuery();
	const { data: users, isLoading: isUsersLoading } = useUsersQuery();

	const isLoading = isStoreLoading || isUsersLoading;

	// Identify Profile (Current User)
	const currentUser = user;

	// Employees are everyone except the current user (if manager) or everyone if super admin?
	// User said "it not Owner, since it based on user login".
	// Let's list everyone EXCEPT the current logged in user.
	const employees: Employee[] = users?.filter(u => u.id !== user?.id).map(u => ({
		id: u.id,
		name: u.name,
		role: u.roleCode === "OWNER" ? "Owner" : u.roleCode === "MANAGER" ? "Manager" : u.roleCode === "STAFF" ? "Staff" : "Cashier",
		email: u.email,
		status: "Active",
		avatar: u.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
	})) || [];

	const handleAddEmployee = () => {
		router.push("/modal/business/add-employee");
	};

	const handleEditStore = () => {
		const targetStoreId = store?.id || user?.storeId;

		if (!targetStoreId) {
			Logger.log("Store ID is missing");
			return;
		}

		const storeData = store ? JSON.stringify(store) : JSON.stringify({ id: user?.storeId });

		router.push({
			pathname: "/modal/business/update-store",
			params: { storeData: storeData }
		});
	}

	const handleEditProfile = () => {
		if (!currentUser) return;
		router.push({
			pathname: "/modal/business/edit-profile",
			params: { userData: JSON.stringify(currentUser) }
		});
	};

	return (
		<View style={$.container}>
			<Header>
				<Text style={$.headerTitle}>{t("business_info")}</Text>
			</Header>
			<ScrollView
				contentContainerStyle={$.contentContainer}
			>
				<View style={$.grid}>
					{/* Left Column */}
					<View style={$.column}>
						<BusinessProfileCard
							name={store?.name || "-"}
							phone={store?.phone || "-"}
							website={store?.email || "-"}
							imageUrl={store?.imageUrl}
							description={store?.description || "-"}
							location={store?.location}
							loading={isLoading}
							onEdit={(user?.roleCode === "OWNER" || user?.roleCode === "MANAGER") ? handleEditStore : undefined}
						/>
						<OwnerInfoCard
							name={currentUser?.name || "-"}
							role={currentUser?.roleCode === "OWNER" ? "Owner" : currentUser?.roleCode === "MANAGER" ? "Manager" : currentUser?.roleCode === "STAFF" ? "Staff" : "Cashier"}
							email={currentUser?.email || "-"}
							loading={isLoading}
							avatar={currentUser?.imageUrl || `https://github.com/shadcn.png`}
							onEdit={(user?.roleCode === "OWNER" || user?.roleCode === "MANAGER") ? handleEditProfile : undefined}
						/>
					</View>

					{/* Right Column */}
					<View style={$.column}>
						<EmployeeListCard
							employees={employees}
							onAddEmployee={(user?.roleCode === "OWNER" || user?.roleCode === "MANAGER") ? handleAddEmployee : undefined}
							loading={isLoading}
						/>
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

const $ = StyleSheet.create((theme) => ({
	container: {
		flex: 1,
		backgroundColor: theme.colors.neutral[200],
	},
	headerTitle: {
		...theme.typography.heading3,
		color: theme.colors.neutral[700],
	},
	contentContainer: {
		padding: theme.spacing.xl,
		paddingTop: 0,
		gap: theme.spacing.xl,
	},
	grid: {
		flexDirection: "row",
		gap: theme.spacing.xl,
	},
	column: {
		flex: 1,
		gap: theme.spacing.xl,
	},
}));

export default BusinessScreen;
