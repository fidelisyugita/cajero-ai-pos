import { useRouter } from "expo-router";
import { type StyleProp, Text, View, type ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcArrowLeft from "@/assets/icons/arrow-left.svg";
import IconButton from "@/components/ui/IconButton";
import { vs } from "@/utils/Scale";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  style?: StyleProp<ViewStyle>;
  rightAction?: React.ReactNode;
  noBack?: boolean;
}

const ScreenHeader = ({ title, onBack, style, rightAction, noBack }: ScreenHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      if (router.canGoBack()) {
        router.back();
      }
    }
  };

  return (
    <View style={[$.container, style]}>
      <View style={$.backTitleWrapper}>
        {!noBack && (
          <IconButton
            Icon={IcArrowLeft}
            onPress={handleBack}
            size="md"
            variant="neutral-no-stroke"
          />
        )}
        <Text style={[$.title, noBack && { marginLeft: vs(40) }]}>{title}</Text>
      </View>
      {rightAction}
    </View>
  );
};

const $ = StyleSheet.create((theme, rt) => ({
  container: {
    paddingTop: (rt.insets.top || theme.spacing.xl) + theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.sup.yellow,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: vs(14),
    paddingRight: theme.spacing.xl,
  },
  backTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  title: {
    ...theme.typography.labelXl,
    color: theme.colors.neutral[700],
  },
}));

export default ScreenHeader;
