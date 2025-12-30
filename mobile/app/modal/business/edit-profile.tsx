import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, View, ScrollView, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { z } from "zod";
import IcAddImage from "@/assets/icons/add-image.svg";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ScreenModal from "@/components/ui/ScreenModal";
import { vs } from "@/utils/Scale";
import { useUpdateUserMutation } from "@/services/mutations/useUpdateUserMutation";
import { useUploadImageMutation } from "@/services/mutations/useUploadImageMutation";
import { User } from "@/services/types/User";
import Logger from "@/services/logger";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  // roleCode is read-only for now
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
      "Password must contain at least one uppercase, one lowercase, and one number"
    )
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  imageUrl: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const EditProfileModal = () => {
  const router = useRouter();
  const { userData } = useLocalSearchParams<{ userData: string }>();
  const user: User | null = userData ? JSON.parse(userData) : null;
  const { mutateAsync: updateUser, isPending } = useUpdateUserMutation();
  const { mutateAsync: uploadImage, isPending: isUploadingImage } = useUploadImageMutation();

  const { control, handleSubmit, reset, setValue, watch } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      imageUrl: "",
    },
  });

  const currentImageUrl = watch("imageUrl");

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        password: "", // Don't pre-fill password
        imageUrl: user.imageUrl || "",
      });
    }
  }, [userData]);

  const handleUploadPress = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      // Filter out empty password if not changing it
      const payload: any = { ...data };
      if (!payload.password) {
        delete payload.password;
      }

      await updateUser({ id: user.id, data: payload });
      if (router.canGoBack()) router.back();
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Logger.error("Failed to update profile", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    }
  };

  return (
    <ScreenModal modalStyle={$.modal}>
      <ScreenModal.Header title="Edit Profile" hideCloseButton />
      <ScreenModal.Body>
        <View style={$.container}>
          <ScrollView contentContainerStyle={$.scrollContent}>

            <View style={$.imageSection}>
              <TouchableOpacity onPress={handleUploadPress} activeOpacity={0.8} disabled={isUploadingImage}>
                {currentImageUrl ? (
                  <Image source={{ uri: currentImageUrl }} style={$.imagePreview} contentFit="cover" />
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
              {isUploadingImage && <View style={$.uploadingBadge}><View style={$.loadingDot} /></View>}
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
    position: 'absolute',
    bottom: 0,
    right: '50%',
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
    backgroundColor: 'white',
    borderRadius: 4,
  },
}));

export default EditProfileModal;
