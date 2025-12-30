import React from "react";
import { View, Text, Modal, ScrollView, Image, Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IconButton from "@/components/ui/IconButton";
import { Feather } from "@expo/vector-icons";
import { PettyCash } from "@/services/types/PettyCash";
import dayjs from "dayjs";
import { formatCurrency } from "@/utils/Format";

interface ExpenseDetailModalProps {
  visible: boolean;
  onClose: () => void;
  expense: PettyCash | null;
}

const CloseIcon = ({ width, style }: { width: number; style: any }) => (
  <Feather name="x" size={width} style={style} />
);

const ExpenseDetailModal = ({ visible, onClose, expense }: ExpenseDetailModalProps) => {
  if (!expense) return null;

  return (
    // ... inside the component
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={$.overlay} onPress={onClose}>
        <Pressable style={$.container} onPress={(e) => e.stopPropagation()}>
          <View style={$.header}>
            <Text style={$.title}>Expense Details</Text>
            <IconButton
              Icon={CloseIcon}
              onPress={onClose}
              size="sm"
              variant="neutral-no-stroke"
            />
          </View>

          <ScrollView style={$.content}>
            {/* Image Proof */}
            {expense.imageUrl ? (
              <View style={$.imageContainer}>
                <Image
                  source={{ uri: expense.imageUrl }}
                  style={$.image}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={[$.imageContainer, $.noImage]}>
                <Feather name="image" size={40} color="#ccc" />
                <Text style={$.noImageText}>No Image Proof</Text>
              </View>
            )}

            <View style={$.detailsContainer}>
              <View style={$.row}>
                <Text style={$.label}>Amount</Text>
                <Text style={[$.value, $.amount, { color: expense.isIncome ? 'green' : 'red' }]}>
                  {expense.isIncome ? '+' : '-'} {formatCurrency(expense.amount)}
                </Text>
              </View>

              <View style={$.divider} />

              <View style={$.row}>
                <Text style={$.label}>Date</Text>
                <Text style={$.value}>
                  {dayjs(expense.createdAt).format("DD MMM YYYY, HH:mm")}
                </Text>
              </View>

              <View style={$.divider} />

              <View style={$.row}>
                <Text style={$.label}>Type</Text>
                <View style={[$.badge, { backgroundColor: expense.isIncome ? '#d1fae5' : '#fee2e2' }]}>
                  <Text style={[$.badgeText, { color: expense.isIncome ? '#047857' : '#b91c1c' }]}>
                    {expense.isIncome ? "Income" : "Expense"}
                  </Text>
                </View>
              </View>

              <View style={$.divider} />

              <View style={$.row}>
                <Text style={$.label}>Created By</Text>
                <Text style={$.value}>{expense.createdByName || "Unknown"}</Text>
              </View>

              <View style={$.divider} />

              <View style={$.section}>
                <Text style={$.label}>Description</Text>
                <Text style={$.description}>{expense.description}</Text>
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const $ = StyleSheet.create((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  container: {
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.lg,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexShrink: 1, // Ensure it shrinks if needed
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.neutral[100],
  },
  title: {
    ...theme.typography.heading5,
    color: theme.colors.neutral[700],
  },
  content: {
    padding: theme.spacing.lg,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    backgroundColor: theme.colors.neutral[100],
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderStyle: 'dashed',
  },
  noImageText: {
    ...theme.typography.bodySm,
    color: theme.colors.neutral[500],
    marginTop: theme.spacing.sm,
  },
  detailsContainer: {
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  section: {
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  label: {
    ...theme.typography.bodySm,
    color: theme.colors.neutral[500],
  },
  value: {
    ...theme.typography.bodyMd,
    color: theme.colors.neutral[700],
    fontWeight: '500',
  },
  amount: {
    ...theme.typography.heading5,
    fontWeight: 'bold',
  },
  description: {
    ...theme.typography.bodyMd,
    color: theme.colors.neutral[700],
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.neutral[200],
    marginVertical: theme.spacing.xs,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  badgeText: {
    ...theme.typography.labelSm,
    fontWeight: '600',
  },
}));

export default ExpenseDetailModal;
