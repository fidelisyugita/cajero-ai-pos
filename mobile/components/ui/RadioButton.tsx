import { memo } from "react";
import { TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { vs } from "@/utils/Scale";

interface RadioButtonProps {
  checked: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

const RadioButton = memo(({ checked, onPress, disabled }: RadioButtonProps) => {
  const outerStyle = [$.outer, checked && $.outerChecked, disabled && $.outerDisabled];
  const inner = checked ? <View style={$.inner} /> : null;

  if (!onPress) {
    return (
      <View
        accessible
        accessibilityRole="radio"
        accessibilityState={{ checked, disabled }}
        style={outerStyle}
      >
        {inner}
      </View>
    );
  }

  return (
    <TouchableOpacity
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      onPress={onPress}
      disabled={disabled}
      style={outerStyle}
      activeOpacity={0.8}
    >
      {inner}
    </TouchableOpacity>
  );
});

const $ = StyleSheet.create((theme) => ({
  outer: {
    borderWidth: vs(1),
    borderRadius: theme.radius.full,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.neutral[200],
    width: vs(24),
    height: vs(24),
    borderColor: theme.colors.neutral[400],
  },
  outerChecked: {
    borderColor: theme.colors.primary[300],
    backgroundColor: theme.colors.primary[100],
  },
  outerDisabled: {
    opacity: 0.5,
  },
  inner: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary[400],
    width: vs(8),
    height: vs(8),
  },
}));

export default RadioButton;
