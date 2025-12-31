import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, View, ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { z } from "zod";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ScreenModal from "@/components/ui/ScreenModal";
import { vs } from "@/utils/Scale";
import { useCreateUserMutation } from "@/services/mutations/useCreateUserMutation";
import Select from "@/components/ui/Select";
import Logger from "@/services/logger";

const employeeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  roleCode: z.string().min(1, "Role is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
      "Password must contain at least one uppercase, one lowercase, and one number"
    ),
  phone: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const ROLES = [
  { label: "Staff", value: "STAFF" },
  { label: "Cashier", value: "CASHIER" },
  { label: "Manager", value: "MANAGER" },
];

const AddEmployeeModal = () => {
  const router = useRouter();
  const { mutateAsync: createUser, isPending } = useCreateUserMutation();

  const { control, handleSubmit } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      roleCode: "CASHIER",
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      await createUser(data);
      if (router.canGoBack()) router.back();
      Alert.alert("Success", "Employee added successfully");
    } catch (error: any) {
      Logger.error("Failed to add employee:", error);
      Alert.alert("Error", error.message || "Failed to add employee");
    }
  };

  return (
    <ScreenModal modalStyle={$.modal}>
      <ScreenModal.Header title="Add New Employee" hideCloseButton />
      <ScreenModal.Body>
        <View style={$.container}>
          <ScrollView contentContainerStyle={$.scrollContent}>
            <View style={$.form}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="Full Name"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    size="lg"
                  />
                )}
              />
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="Email"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    size="lg"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="Phone Number"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    size="lg"
                    keyboardType="phone-pad"
                  />
                )}
              />
              <Controller
                control={control}
                name="roleCode"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Select
                    label="Role"
                    options={ROLES}
                    value={value}
                    onSelect={onChange}
                    placeholder="Select Role"
                    containerStyle={{ marginBottom: 0 }}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="Password"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    size="lg"
                    secureTextEntry
                  />
                )}
              />
            </View>
          </ScrollView>
        </View>
      </ScreenModal.Body>
      <ScreenModal.Footer>
        <View style={$.footerButtons}>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => router.back()}
            style={{ flex: 1 }}
          />
          <Button
            title="Create Employee"
            variant="primary"
            onPress={handleSubmit(onSubmit)}
            isLoading={isPending}
            style={{ flex: 1 }}
          />
        </View>
      </ScreenModal.Footer>
    </ScreenModal>
  );
};

const $ = StyleSheet.create((theme) => ({
  modal: {
    width: vs(500),
    height: "80%",
    maxHeight: vs(900),
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[100],
  },
  scrollContent: {
    padding: theme.spacing.xl,
  },
  form: {
    gap: theme.spacing.lg,
  },
  footerButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
}));

export default AddEmployeeModal;
