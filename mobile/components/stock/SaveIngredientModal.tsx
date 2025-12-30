import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { t } from "@/services/i18n";
import { Ingredient } from "@/services/types/Ingredient";
import { useMeasureUnitsQuery } from "@/services/queries/useMeasureUnitsQuery";

interface SaveIngredientModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; measureUnitCode: string; description: string }) => void;
  ingredient: Ingredient;
  isLoading?: boolean;
}

const SaveIngredientModal = ({
  visible,
  onClose,
  onSave,
  ingredient,
  isLoading = false,
}: SaveIngredientModalProps) => {
  const { data: measureUnits } = useMeasureUnitsQuery();

  const [name, setName] = useState(ingredient?.name || "");
  const [measureUnitCode, setMeasureUnitCode] = useState(ingredient?.measureUnitCode || "");
  const [description, setDescription] = useState(ingredient?.description || "");

  useEffect(() => {
    if (visible && ingredient) {
      setName(ingredient.name);
      setMeasureUnitCode(ingredient.measureUnitCode);
      setDescription(ingredient.description || "");
    }
  }, [ingredient, visible]);

  const handleSave = () => {
    onSave({
      name,
      measureUnitCode,
      description,
    });
  };

  const measureUnitOptions = measureUnits?.map((mu) => ({
    label: mu.code, // using code as label since name might be descriptive
    value: mu.code,
  })) || [];

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
          <Text style={$.modalTitle}>{t("edit_ingredient")}</Text>

          <View style={$.formContainer}>
            <Input
              label={t("name")}
              value={name}
              onChangeText={setName}
              placeholder={t("ingredient_name")}
            />

            <Select
              label={t("measure_unit")}
              options={measureUnitOptions}
              value={measureUnitCode}
              onSelect={setMeasureUnitCode}
              placeholder={t("select_measure_unit")}
            />

            <Input
              label={t("description")}
              value={description}
              onChangeText={setDescription}
              placeholder={t("description")}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
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

export default SaveIngredientModal;
