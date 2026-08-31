import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcPlus from "@/assets/icons/plus.svg";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import FormSectionCard from "@/components/ui/FormSectionCard";
import Skeleton from "@/components/ui/Skeleton";
import { t } from "@/services/i18n";
import { vs } from "@/utils/Scale";
import EmployeeItem, { type Employee } from "./EmployeeItem";

interface EmployeeListCardProps {
  employees: Employee[];
  onAddEmployee?: () => void;
  loading?: boolean;
}

const renderPlusIcon = (size: number, color: string) => (
  <IcPlus width={size} height={size} color={color} />
);

const EmployeeListCard = ({ employees, onAddEmployee, loading }: EmployeeListCardProps) => {
  // Custom container instead of FormSectionCard because header is different
  return (
    <View style={$.container}>
      {loading ? (
        <Skeleton width="100%" height={200} borderRadius={16} />
      ) : (
        <FormSectionCard title={t("management_employee")}>
          <View style={$.list}>
            {employees.length === 0 ? (
              <EmptyState
                title={t("empty_employees_title")}
                subtitle={t("empty_employees_subtitle")}
                style={{ paddingBottom: 0, marginBottom: -vs(20) }}
              />
            ) : (
              employees.map((employee) => (
                <EmployeeItem key={employee.id} employee={employee} onPressDetails={() => {}} />
              ))
            )}
            {!loading && onAddEmployee && employees.length < 5 && (
              <Button
                title={t("add_employee")}
                variant="primary"
                size="sm"
                leftIcon={renderPlusIcon}
                style={{ width: vs(150), alignSelf: "center", marginTop: vs(10) }}
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
