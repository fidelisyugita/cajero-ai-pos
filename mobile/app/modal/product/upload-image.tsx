import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import IcImage from "@/assets/icons/image.svg";
import IcUpload from "@/assets/icons/upload.svg";
import IcX from "@/assets/icons/x.svg";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import ScreenModal from "@/components/ui/ScreenModal";
import { t } from "@/services/i18n";
import useImageSelectionStore from "@/store/useImageSelectionStore";
import colors from "@/tokens/Colors";
import { rgbaStringToHex6 } from "@/utils/Convert";
import { vs } from "@/utils/Scale";

const UniIcImage = withUnistyles(IcImage, (theme) => ({
  color: theme.colors.neutral[600],
  width: vs(80),
  height: vs(80),
}));

const _UniIcUpload = withUnistyles(IcUpload, (theme) => ({
  color: theme.colors.primary[400],
  width: vs(20),
  height: vs(20),
}));

const COLOR_OPTIONS = [
  colors.primary[100],
  colors.primary[200],
  colors.primary[300],
  colors.pressed[5],
  colors.pressed[2],
  colors.pressed[3],
];

const getImagePlaceholderColor = (hexColor: string) => {
  if (hexColor.startsWith("#")) {
    hexColor = hexColor.slice(1);
  }

  return `https://placehold.co/16x9/${hexColor}/${hexColor}`;
};

const renderUploadIcon = (size: number, color: string) => (
  <IcUpload color={color} height={size} width={size} />
);

const UploadImageModal = () => {
  const router = useRouter();
  const { title } = useLocalSearchParams<{ title: string }>();

  const { imageUri, setImageUri, onImageUploaded, setOnImageUploaded } = useImageSelectionStore();
  const [urlInput, setUrlInput] = useState(imageUri || "");

  const chooseFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <ScreenModal modalStyle={$.modal}>
      <ScreenModal.Header title={title || t("upload_image")} />
      <ScreenModal.Body>
        <View style={$.container}>
          {urlInput || imageUri ? (
            <Image contentFit="cover" source={urlInput || imageUri} style={$.image} />
          ) : (
            <View style={$.imagePlaceholder}>
              <UniIcImage />
            </View>
          )}

          <View style={$.uploadImage}>
            <Text style={$.uploadImageText}>{t("upload_image")}</Text>
            <Button
              leftIcon={renderUploadIcon}
              onPress={chooseFile}
              size="md"
              title={t("choose_file")}
              variant="soft"
            />
          </View>

          <Input
            defaultValue={urlInput}
            label="Image URL"
            onChangeText={setUrlInput}
            placeholder="https://..."
            right={
              urlInput ? (
                <IconButton
                  Icon={IcX}
                  onPress={() => {
                    setUrlInput("");
                    setImageUri("");
                  }}
                  size="sm"
                  variant="neutral-no-stroke"
                />
              ) : null
            }
          />

          <View style={$.chooseColor}>
            <Text style={$.chooseColorText}>{t("choose_color")}</Text>
            <FlatList
              contentContainerStyle={$.colorOptionsContent}
              data={COLOR_OPTIONS}
              horizontal
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    const color = getImagePlaceholderColor(
                      item.indexOf("rgba") > -1 ? rgbaStringToHex6(item) : item,
                    );
                    setUrlInput(color);
                    setImageUri(color);
                  }}
                  style={$.colorItem(item)}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>
      </ScreenModal.Body>
      <ScreenModal.Footer>
        <Button
          onPress={() => {
            router.dismiss();
            setImageUri("");
            setUrlInput("");
          }}
          size="md"
          style={$.flex}
          title={t("cancel")}
          variant="secondary"
        />
        <Button
          onPress={() => {
            const finalUri = urlInput || imageUri || "";
            onImageUploaded?.(finalUri);
            setImageUri(finalUri);
            setOnImageUploaded(undefined);
            router.dismiss();
          }}
          size="md"
          style={$.flex}
          title={t("save")}
          variant="primary"
        />
      </ScreenModal.Footer>
    </ScreenModal>
  );
};

const $ = StyleSheet.create((theme) => ({
  modal: {
    aspectRatio: 451 / 666,
    width: vs(451),
  },
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  imagePlaceholder: {
    aspectRatio: 16 / 9,
    backgroundColor: theme.colors.neutral[300],
    borderWidth: 1,
    borderColor: theme.colors.neutral[400],
    borderRadius: theme.radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    aspectRatio: 16 / 9,
    borderWidth: 1,
    borderColor: theme.colors.neutral[400],
    borderRadius: theme.radius.sm,
  },
  uploadImage: {
    gap: theme.spacing.md,
    alignItems: "flex-start",
  },
  uploadImageText: {
    ...theme.typography.labelLg,
    color: theme.colors.neutral[600],
  },
  chooseColor: {
    gap: theme.spacing.md,
    alignItems: "flex-start",
  },
  chooseColorText: {
    ...theme.typography.labelLg,
    color: theme.colors.neutral[600],
  },
  colorItem: (color: string) => ({
    backgroundColor: color,
    aspectRatio: 1,
    width: vs(60),
    borderRadius: theme.spacing.xs,
  }),
  colorOptionsContent: {
    gap: theme.spacing.sm,
  },
  flex: {
    flex: 1,
  },
}));

export default UploadImageModal;
