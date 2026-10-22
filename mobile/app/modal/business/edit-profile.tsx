import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { z } from "zod";
import IcAddImage from "@/assets/icons/add-image.svg";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ScreenModal from "@/components/ui/ScreenModal";
import Logger from "@/services/logger";
import { useUpdateUserMutation } from "@/services/mutations/useUpdateUserMutation";
import { useUploadImageMutation } from "@/services/mutations/useUploadImageMutation";
import type { AuthUser } from "@/services/types/Auth";
import type { CreateUserRequest, User } from "@/services/types/User";
import { useAuthStore } from "@/store/useAuthStore";
import { vs } from "@/utils/Scale";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("Invalid email"),
  // roleCode is read-only for now
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
      "Password must contain at least one uppercase, one lowercase, and one number",
    )
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  imageUrl: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function resolveUser(userData?: string, authUser?: AuthUser | User | null): User | null {
  if (userData) {
    try {
      return JSON.parse(userData) as User;
    } catch {
      // Fall through to authUser
    }
  }
  if (!authUser) return null;
  return {
    id: authUser.id || "",
    name: authUser.name || "",
    email: authUser.email || "",
    phone: authUser.phone || "",
    storeId: authUser.storeId || "",
    roleCode: authUser.roleCode || "",
    imageUrl: authUser.imageUrl || "",
  };
}

function buildProfilePayload(data: ProfileFormData): Partial<CreateUserRequest> {
  const payload: Partial<CreateUserRequest> = { ...data };
  if (!payload.password) {
    payload.password = undefined;
  }
  return payload;
}

function syncAuthUser(
  authUser: AuthUser | null | undefined,
  targetId: string,
  updatedUser: User,
): void {
  if (authUser && authUser.id === targetId) {
    useAuthStore.getState().setUser({
      ...authUser,
      name: updatedUser.name || authUser.name,
      email: updatedUser.email || authUser.email,
      phone: updatedUser.phone ?? authUser.phone,
      imageUrl: updatedUser.imageUrl ?? authUser.imageUrl,
    });
  }
}

const EditProfileModal = () => {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const { userData } = useLocalSearchParams<{ userData?: string }>();
  const user = resolveUser(userData, authUser);
  const { mutateAsync: updateUser, isPending } = useUpdateUserMutation();
  const { mutateAsync: uploadImage, isPending: isUploadingImage } = useUploadImageMutation();

  const { control, handleSubmit, setValue, watch } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      password: "",
      imageUrl: user?.imageUrl || "",
    },
  });

  const currentImageUrl = watch("imageUrl");

  const handleUploadPress = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;

        // Upload immediately
        const uploadedUrl = await uploadImage({
          fileUri: selectedUri,
          type: "user",
          id: user?.id,
        });

        setValue("imageUrl", uploadedUrl);
      }
    } catch (error) {
      Logger.error("Upload failed", error);
      Alert.alert("Error", "Failed to upload image");
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    try {
      const payload = buildProfilePayload(data);
      const updatedUser = await updateUser({ id: user.id, data: payload });
      syncAuthUser(authUser, user.id, updatedUser);

      if (router.canGoBack()) router.back();
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: unknown) {
      Logger.error("Failed to update profile", error);
      const msg = error instanceof Error ? error.message : "Failed to update profile";
      Alert.alert("Error", msg);
    }
  };

  return (
    <ScreenModal modalStyle={$.modal}>
      <ScreenModal.Header title="Edit Profile" hideCloseButton />
      <ScreenModal.Body>
        <View style={$.container}>
          <ScrollView contentContainerStyle={$.scrollContent}>
            <View style={$.imageSection}>
              <TouchableOpacity
                onPress={handleUploadPress}
                activeOpacity={0.8}
                disabled={isUploadingImage}
              >
                {currentImageUrl ? (
                  <Image
                    source={{ uri: currentImageUrl }}
                    style={$.imagePreview}
                    contentFit="cover"
                  />
                ) : (
                  <View style={$.imagePlaceholder}>
                    {isUploadingImage ? (
                      <View style={$.loadingPlaceholder} />
                    ) : (
                      <IcAddImage width={40} height={40} color="#9CA3AF" />
                    )}
                  </View>
                )}
              </TouchableOpacity>
              {isUploadingImage && (
                <View style={$.uploadingBadge}>
                  <View style={$.loadingDot} />
                </View>
              )}
            </View>

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
                    // readOnly? Assuming user can change email
                  />
                )}
              />
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="Phone Number"
                    value={value || ""}
                    onChangeText={onChange}
                    error={error?.message}
                    size="lg"
                    keyboardType="phone-pad"
                  />
                )}
              />

              <Input
                label="Role"
                value={user?.roleCode || ""}
                editable={false} // Role cannot be changed by self-edit usually
                size="lg"
                containerStyle={{ opacity: 0.7 }}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="New Password (Optional)"
                    value={value || ""}
                    onChangeText={onChange}
                    error={error?.message}
                    size="lg"
                    secureTextEntry
                    placeholder="Leave blank to keep current"
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
            title="Update Profile"
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
    width: "90%",
    maxWidth: 500,
    maxHeight: "90%",
  },
  container: {
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
  imageSection: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  imagePreview: {
    width: vs(100),
    height: vs(100),
    borderRadius: vs(50),
    backgroundColor: theme.colors.neutral[200],
  },
  imagePlaceholder: {
    width: vs(100),
    height: vs(100),
    borderRadius: vs(50),
    backgroundColor: theme.colors.neutral[200],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderStyle: "dashed",
  },
  loadingPlaceholder: {
    width: 20,
    height: 20,
    backgroundColor: theme.colors.neutral[400],
    borderRadius: 10,
  },
  uploadingBadge: {
    position: "absolute",
    bottom: 0,
    right: "50%",
    marginRight: -vs(50), // Align with edge of image
    backgroundColor: theme.colors.primary[500],
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingDot: {
    width: 8,
    height: 8,
    backgroundColor: "white",
    borderRadius: 4,
  },
}));

export default EditProfileModal;
