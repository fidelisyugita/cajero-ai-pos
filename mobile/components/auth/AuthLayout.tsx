import { Image } from "expo-image";
import { Text, View, type ViewStyle } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import Logo from "@/assets/images/logo.webp";
import { t } from "../../services/i18n";
import { vs } from "../../utils/Scale";
import KeyboardForm from "../ui/KeyboardForm";

interface AuthLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface IntroProps {
  position: "left" | "right";
  children?: React.ReactNode;
}

interface MainProps {
  title: string;
  children?: React.ReactNode;
}

interface BalloonProps {
  size: number;
  position: { top?: number; left?: number; bottom?: number; right?: number };
}

const AuthLayout = ({ style, children }: AuthLayoutProps) => {
  return <SafeAreaView edges={[]} style={[$.container, style]}>{children}</SafeAreaView>;
};

const Intro = ({ position, children }: IntroProps) => {
  const insets = useSafeAreaInsets();
  const isRight = position === "right";

  return (
    <View style={$.introContainer}>
      <View style={$.balloonWrapper}>
        <Balloon
          position={{
            top: -vs(266) - insets.top,
            [isRight ? "left" : "right"]: -vs(129),
          }}
          size={vs(467)}
        />
        <Balloon
          position={{
            top: vs(268) - insets.top,
            [isRight ? "right" : "left"]: vs(141),
          }}
          size={vs(70)}
        />
        <Balloon
          position={{
            top: vs(638) - insets.top,
            [isRight ? "right" : "left"]: vs(252),
          }}
          size={vs(38)}
        />
        <Balloon
          position={{
            top: vs(735) - insets.top,
            [isRight ? "left" : "right"]: -vs(111 / 2),
          }}
          size={vs(111)}
        />
        <Balloon
          position={{
            bottom: -vs(203) - insets.bottom,
            [isRight ? "right" : "left"]: -vs(42),
          }}
          size={vs(345)}
        />
      </View>

      {/* content */}
      <View style={$.introContent}>
        <Text style={$.title}>{t("intro_title")}</Text>
        <Image contentFit="contain" source={Logo} style={$.logo} />
        <Text style={$.subtitle}>{t("intro_subtitle")}</Text>
      </View>

      {children}
    </View>
  );
};

const Main = ({ title, children }: MainProps) => {
  return (
    <View style={$.mainContainer}>
      <KeyboardForm contentContainerStyle={$.formContent}>
        <Text style={$.mainTitle}>{title}</Text>
        {children}
      </KeyboardForm>
    </View>
  );
}

const Balloon = ({ size, position }: BalloonProps) => {
  return (
    <View style={[$.balloon, { width: size, height: size, ...position }]} />
  );
};

AuthLayout.Intro = Intro;
AuthLayout.Main = Main;

const $ = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[200],
    flexDirection: "row",
  },
  balloon: {
    position: "absolute",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.sup.red,
  },
  introContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.sup.yellow,
    width: vs(785),
    zIndex: 2,
    //shadow
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
    gap: theme.spacing.xxl,
  },
  balloonWrapper: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  introContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: vs(92),
  },
  logo: {
    height: vs(320),
    aspectRatio: 1,
  },
  title: {
    ...theme.typography.heading1,
    color: theme.colors.neutral[700],
    textAlign: "center",
  },
  subtitle: {
    ...theme.typography.bodyXl,
    color: theme.colors.neutral[700],
    textAlign: "center",
  },

  mainContainer: {
    // paddingTop: rt.insets.top + vs(56),
    flex: 3,
    // gap: theme.spacing.xxl,
    backgroundColor: theme.colors.neutral[200],
  },
  mainTitle: {
    ...theme.typography.heading2,
    color: theme.colors.neutral[700],
    textAlign: "center",
  },
  formContent: {
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.xxl,
    justifyContent: "center",
  }

}));

export default AuthLayout;
