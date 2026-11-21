import { type FC, memo, useCallback } from "react";
import { Text, TouchableOpacity } from "react-native";
import type { SvgProps } from "react-native-svg";
import { StyleSheet } from "react-native-unistyles";
import colors from "@/tokens/Colors";
import { vs } from "@/utils/Scale";

interface SidebarItemProps {
  Icons: FC<SvgProps>[];
  isActive: boolean;
  label: string;
  path?: string;
  onPress: (path?: string) => void;
}

const ICON_SIZE = vs(36);

const SidebarItem = memo(({ Icons, isActive, label, path, onPress }: SidebarItemProps) => {
  const Icon = isActive ? Icons[1] : Icons[0];

  const handlePress = useCallback(() => {
    onPress(path);
  }, [onPress, path]);

  return (
    <TouchableOpacity
      disabled={isActive}
      onPress={handlePress}
      style={isActive ? [styles.container, styles.containerActive] : styles.container}
    >
      <Icon color={colors.primary[400]} height={ICON_SIZE} width={ICON_SIZE} />
      <Text style={styles.label} adjustsFontSizeToFit numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create((theme) => ({
  container: {
    borderRadius: theme.radius.lg,
    width: vs(68),
    height: vs(68),
    alignItems: "center",
    gap: theme.spacing.xs / 2,
    justifyContent: "center",
  },
  containerActive: {
    borderWidth: vs(1),
    borderColor: theme.colors.primary[400],
  },
  label: {
    ...theme.typography.labelXs,
    color: theme.colors.primary[400],
    textAlign: "center",
  },
}));

export default SidebarItem;
