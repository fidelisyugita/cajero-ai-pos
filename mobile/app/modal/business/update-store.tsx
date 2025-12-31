import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { t } from "@/services/i18n";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, Text, View, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { z } from "zod";
import IcUpload from "@/assets/icons/upload.svg";
import IcAddImage from "@/assets/icons/add-image.svg";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ScreenModal from "@/components/ui/ScreenModal"; // Using reusable modal wrapper
import { vs } from "@/utils/Scale";
import { useUpdateStoreMutation } from "@/services/mutations/useUpdateStoreMutation";
import { useUploadImageMutation } from "@/services/mutations/useUploadImageMutation";
import Logger from "@/services/logger";


const COLOR_OPTIONS = [
  "#FCE7F3", // Pink 100
  "#D6BCFA", // Purple 200 (approx) - wait, taking from image
  "#FBCFE8", // Pink 200
  "#F472B6", // Pink 400
  "#EC4899", // Pink 500
  "#DB2777", // Pink 600
  "#BE185D", // Pink 700
];

// Refined colors based on image
const AVATAR_COLORS = [
  "#F3E8EA", // Lightest
  "#D9A5A4", // Muted Pink
  "#A85C5C", // Deep Muted Red
  "#B93F3F", // Red
  "#D9B4B4", // Soft Pink
  "#7D5050", // Brownish
];

const storeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional(), // Mapped to 'Website' field in UI
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  // vatNumber: z.string().optional(), // Not in API, ignoring
});

type StoreFormData = z.infer<typeof storeSchema>;

const UpdateStoreModal = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse initial data from params
  const initialData = useMemo(() => {
    try {
      if (params.storeData) {
        return JSON.parse(params.storeData as string);
      }
    } catch (e) {
      Logger.error("Failed to parse store data", e);
    }
    return {
      id: params.id as string, // Fallback if old params still used
      name: "",
      phone: "",
      email: "",
      description: "",
      imageUrl: "",
    };
  }, [params]);

  const { mutateAsync: updateStore, isPending: isUpdating } = useUpdateStoreMutation();
  // Using upload mutation directly if we want to handle upload here, 
  // BUT product/add.tsx uses a separate modal flow. 
  // For simplicity in this task, I'll direct user to existing upload modal if possible 
  // or just implement a simple picker if I had `expo-image-picker`. 
  // Since I don't want to overcomplicate, I'll check if `useUploadImageMutation` works with a file URI from `expo-image-picker`.


  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: initialData.name || "",
      phone: initialData.phone || "",
      email: initialData.email || "",
      description: initialData.description || "",
      imageUrl: initialData.imageUrl || "",
    },
  });

  const currentImageUrl = watch("imageUrl");

  const { mutateAsync: uploadImage, isPending: isUploadingImage } = useUploadImageMutation();

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

        // Optimistically show the selected image
        // or just wait for upload? 
        // Showing selected image immediately is better UX, but we need to know it's uploading.
        // For now, let's just upload it.

        const uploadedUrl = await uploadImage({
          fileUri: selectedUri,
          type: "store",
          id: initialData.id, // store id
        });

        setValue("imageUrl", uploadedUrl);
      }
    } catch (error) {
      Logger.error("Upload failed", error);
      Alert.alert("Error", "Failed to upload image");
    }
  };

  const handleColorSelect = (color: string) => {
    // Generate a placeholder URL with the color
    const avatarUrl = `https://ui-avatars.com/api/?background=${color.replace("#", "")}&name=${encodeURIComponent(watch("name") || "Store")}&color=fff&size=256`;
    setValue("imageUrl", avatarUrl);
  };

  const onSubmit = async (data: StoreFormData) => {
    try {
      await updateStore({
        id: initialData.id,
        data: {
          ...initialData, // Spread existing data first to preserve other fields
          ...data,        // Overwrite with form data
          id: initialData.id // Ensure ID is present
        }
      });

      // Success
      if (router.canGoBack()) router.back();
      Alert.alert("Success", "Store profile updated successfully");
    } catch (error: any) {
      Logger.error("Failed to update store", error);
      Alert.alert("Error", error.message || "Failed to update store");
    }
  };

  return (
    <ScreenModal modalStyle={$.modal}>
      <ScreenModal.Header title="Edit Business Profile" />
      <ScreenModal.Body>
        <View style={$.container}>
          <ScrollView contentContainerStyle={$.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={$.infoBox}>
              <View style={$.infoIcon}>
                {/* Info Icon placeholder or similar */}
                <Text style={{ color: "#3B82F6", fontWeight: "bold" }}>i</Text>
              </View>
              <Text style={$.infoText}>This data will be reflected on your receipts and reports.</Text>
            </View>

            <Text style={$.sectionLabel}>Upload image or Select from Color Options</Text>

            <View style={$.imageSection}>
              <TouchableOpacity onPress={handleUploadPress} activeOpacity={0.8}>
                {currentImageUrl ? (
                  <Image source={{ uri: currentImageUrl }} style={$.imagePreview} contentFit="cover" />
                ) : (
                  <View style={$.imagePlaceholder}>
                    <IcAddImage width={40} height={40} color="#9CA3AF" />
                  </View>
                )}
              </TouchableOpacity>

              <View style={$.rightColumn}>
                <Text style={$.subLabel}>Choose Color</Text>
                <View style={$.colorGrid}>
                  {AVATAR_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[$.colorSwatch, { backgroundColor: c }]}
                      onPress={() => handleColorSelect(c)}
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={[$.uploadButton, isUploadingImage && $.uploadButtonDisabled]}
                  onPress={handleUploadPress}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    <Text style={$.uploadButtonText}>Uploading...</Text>
                  ) : (
                    <>
                      <IcUpload width={16} height={16} color="#B91C1C" />
                      <Text style={$.uploadButtonText}>Upload Image</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={$.form}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="Business Name"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    size="lg"
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
              {/* VAT Number - Not bound, visual only? Or disable? I'll omit to avoid confusion as per plan */}
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
                name="description"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="Description"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    // size="lg"
                    multiline
                    numberOfLines={3}
                    style={{ height: vs(80) }}
                    maxLength={255}
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
            title="Save"
            variant="primary"
            onPress={handleSubmit(onSubmit)}
            isLoading={isUpdating}
            style={{ flex: 1 }}
          />
        </View>
      </ScreenModal.Footer>
    </ScreenModal>
  );
};

const $ = StyleSheet.create((theme) => ({
  modal: {
    width: vs(600),
    height: "90%",
    maxHeight: vs(900),
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[100],
  },
  scrollContent: {
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DBEAFE", // blue-100
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    gap: theme.spacing.sm,
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    ...theme.typography.bodySm,
    color: "#1E40AF", // blue-800
    flex: 1,
  },
  sectionLabel: {
    ...theme.typography.heading5,
    color: theme.colors.neutral[700],
  },
  imageSection: {
    flexDirection: "row",
    gap: theme.spacing.xl,
    alignItems: "flex-start",
  },
  imagePreview: {
    width: vs(120),
    height: vs(120),
    borderRadius: vs(60),
    backgroundColor: theme.colors.neutral[200],
  },
  imagePlaceholder: {
    width: vs(120),
    height: vs(120),
    borderRadius: vs(60),
    backgroundColor: theme.colors.neutral[200],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  rightColumn: {
    flex: 1,
    gap: theme.spacing.md,
  },
  subLabel: {
    ...theme.typography.bodyMd,
    color: theme.colors.neutral[600],
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  colorSwatch: {
    width: vs(40),
    height: vs(40),
    borderRadius: theme.radius.xs,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: "#B91C1C", // red-700
    borderRadius: theme.radius.sm,
    backgroundColor: "#FEF2F2", // red-50
    alignSelf: "flex-start",
  },
  uploadButtonText: {
    ...theme.typography.labelMd,
    color: "#B91C1C",
  },
  form: {
    gap: theme.spacing.lg,
  },
  footerButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
}));

export default UpdateStoreModal;
