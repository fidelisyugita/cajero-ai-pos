import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { t } from "@/services/i18n";
import type { VariantOption } from "@/services/types/Variant";

interface SaveVariantOptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; priceAdjusment: number }) => void;
  option: VariantOption;
  isLoading?: boolean;
}

const SaveVariantOptionModal = ({
  visible,
  onClose,
  onSave,
  option,
  isLoading = false,
}: SaveVariantOptionModalProps) => {
  const [name, setName] = useState(option?.name || "");
  const [priceAdjusment, setPriceAdjusment] = useState(option?.priceAdjusment?.toString() || "0");

  useEffect(() => {
    if (visible && option) {
      setName(option.name);
      setPriceAdjusment(option.priceAdjusment?.toString() || "0");
    }
  }, [option, visible]);

  const handleSave = () => {
    onSave({
      name,
      priceAdjusment: parseFloat(priceAdjusment) || 0,
    });
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={$.centeredView}
      >
        <TouchableOpacity
          style={$.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={$.modalView}>
          <Text style={$.modalTitle}>{t("edit_option") || "Edit Option"}</Text>

          <View style={$.formContainer}>
            <Input
              label={t("name")}
              value={name}
              onChangeText={setName}
              placeholder={t("option_name") || "Option Name"}
            />

            <Input
              label={t("price_adj")}
              value={priceAdjusment}
              onChangeText={setPriceAdjusment}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          <View style={$.buttonContainer}>
            <Button
              title={t("cancel")}
              variant="secondary"
              onPress={onClose}
              style={$.flex}
            />
            <Button
              title={t("save")}
              variant="primary"
              onPress={handleSave}
              isLoading={isLoading}
              style={$.flex}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const $ = StyleSheet.create((theme) => ({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: theme.spacing.lg,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalView: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    gap: theme.spacing.lg,
  },
  modalTitle: {
    ...theme.typography.heading3,
    color: theme.colors.neutral[700],
    textAlign: "center",
  },
  formContainer: {
    gap: theme.spacing.lg,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  flex: {
    flex: 1,
  },
}));

export default SaveVariantOptionModal;
