import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Button from "@/components/ui/Button";
import { t } from "@/services/i18n";

interface StockUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newStock: number) => void;
  currentStock: number;
  itemName: string;
  isLoading?: boolean;
}

const StockUpdateModal = ({
  visible,
  onClose,
  onSave,
  currentStock,
  itemName,
  isLoading = false,
}: StockUpdateModalProps) => {
  const [stock, setStock] = useState((currentStock ?? 0).toString());

  useEffect(() => {
    setStock((currentStock ?? 0).toString());
  }, [currentStock, visible]);

  const handleSave = () => {
    const parsedStock = parseFloat(stock);
    onSave(parsedStock);
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
          <Text style={$.modalTitle}>
            {t("update_stock_for")} {itemName}
          </Text>

          <View style={$.inputContainer}>
            <Text style={$.label}>{t("new_stock_value")}</Text>
            <TextInput
              style={$.input}
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
              placeholder="0"
              autoFocus
              selectTextOnFocus
            />
          </View>

          <View style={$.buttonContainer}>
            <Button
              title={t("cancel")}
              variant="secondary"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title={t("save")}
              variant="primary"
              onPress={handleSave}
              isLoading={isLoading}
              style={{ flex: 1, marginLeft: 8 }}
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
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalView: {
    width: "90%",
    maxWidth: 400,
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
  },
  modalTitle: {
    ...theme.typography.heading3,
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    ...theme.typography.labelMd,
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: 18,
    color: theme.colors.neutral[700],
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
}));

export default StockUpdateModal;
