import { View, ViewStyle } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import DefaultEmptyStateSvg from "@/assets/images/empty-state.svg";
import { vs } from "@/utils/Scale";
import { SvgProps } from "react-native-svg";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  image?: React.FC<SvgProps>;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

const EmptyState = ({
  title,
  subtitle,
  image: ImageComponent = DefaultEmptyStateSvg,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) => {
  return (
    <View style={[$.container, style]}>
      <View style={$.imageContainer}>
        <ImageComponent width={vs(200)} height={vs(200)} />
      </View>
      <View style={$.textContainer}>
        <Typography variant="headingSm" style={$.title}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="bodyMd" style={$.subtitle}>
            {subtitle}
          </Typography>
        )}
      </View>
      {actionLabel && onAction && (
        <View style={$.actionContainer}>
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            size="md"
          />
        </View>
      )}
    </View>
  );
};

const $ = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
    minHeight: vs(500),
    // backgroundColor: theme.colors.neutral[100], // Optional: distinct background or transparent
  },
  imageContainer: {
    marginBottom: theme.spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    gap: theme.spacing.xs,
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  title: {
    textAlign: "center",
    color: theme.colors.neutral[700],
  },
  subtitle: {
    textAlign: "center",
    color: theme.colors.neutral[500],
    maxWidth: 300,
  },
  actionContainer: {
    width: "100%",
    maxWidth: 250,
  },
}));

export default EmptyState;
