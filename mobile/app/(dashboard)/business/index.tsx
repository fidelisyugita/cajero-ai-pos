import { useRouter } from "expo-router";
import { memo, useCallback, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import BusinessProfileCard from "@/components/business/BusinessProfileCard";
import type { Employee } from "@/components/business/EmployeeItem";
import EmployeeListCard from "@/components/business/EmployeeListCard";
import OwnerInfoCard from "@/components/business/OwnerInfoCard";
import Text from "@/components/ui/Typography";
import { t } from "@/services/i18n";
import Logger from "@/services/logger";
import { useStoreQuery } from "@/services/queries/useStoreQuery";
import { useUsersQuery } from "@/services/queries/useUsersQuery";
import { useAuthStore } from "@/store/useAuthStore";
import Header from "../../../components/dashboard/Header";

function formatRoleName(roleCode?: string): string {
  switch (roleCode) {
    case "OWNER":
      return "Owner";
    case "MANAGER":
      return "Manager";
    case "STAFF":
      return "Staff";
    default:
      return "Cashier";
  }
}

function mapUsersToEmployees(
  users?: Array<{ id: string; name: string; roleCode?: string; email: string; imageUrl?: string }>,
  currentUserId?: string,
): Employee[] {
  if (!users) return [];
  return users
    .filter((u) => u.id !== currentUserId)
    .map((u) => ({
      id: u.id,
      name: u.name,
      role: formatRoleName(u.roleCode),
      email: u.email,
      status: "Active",
      avatar:
        u.imageUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
    }));
}

const BusinessScreen = memo(() => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { data: store, isLoading: isStoreLoading } = useStoreQuery();
  const { data: users, isLoading: isUsersLoading } = useUsersQuery();

  const isLoading = isStoreLoading || isUsersLoading;
  const currentUser = user;
  const canManage = user?.roleCode === "OWNER" || user?.roleCode === "MANAGER";
  const employees = useMemo(() => mapUsersToEmployees(users, user?.id), [users, user?.id]);

  const handleAddEmployee = useCallback(() => {
    router.push("/modal/business/add-employee");
  }, [router]);

  const handleEditStore = useCallback(() => {
    const targetStoreId = store?.id || user?.storeId;

    if (!targetStoreId) {
      Logger.log("Store ID is missing");
      return;
    }

    const storeData = store ? JSON.stringify(store) : JSON.stringify({ id: user?.storeId });

    router.push({
      pathname: "/modal/business/update-store",
      params: { storeData },
    });
  }, [store, user?.storeId, router]);

  const handleEditProfile = useCallback(() => {
    if (!currentUser) return;
    router.push("/modal/business/edit-profile");
  }, [currentUser, router]);

  return (
    <View style={$.container}>
      <Header>
        <Text style={$.headerTitle}>{t("business_info")}</Text>
      </Header>
      <ScrollView contentContainerStyle={$.contentContainer}>
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
              onEdit={canManage ? handleEditStore : undefined}
            />
            <OwnerInfoCard
              name={currentUser?.name || "-"}
              role={formatRoleName(currentUser?.roleCode)}
              email={currentUser?.email || "-"}
              loading={isLoading}
              avatar={currentUser?.imageUrl || "https://github.com/shadcn.png"}
              onEdit={canManage ? handleEditProfile : undefined}
            />
          </View>

          {/* Right Column */}
          <View style={$.column}>
            <EmployeeListCard
              employees={employees}
              onAddEmployee={canManage ? handleAddEmployee : undefined}
              loading={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

BusinessScreen.displayName = "BusinessScreen";

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
