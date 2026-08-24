import "react-native-unistyles/mocks";
import { cleanup } from "@testing-library/react-native";
import "./config/Unistyles";

afterEach(async () => {
  await cleanup();
});

const React = require("react");
const unistyles = require("react-native-unistyles");
unistyles.withUnistyles = (Component: any, mapper: any) => {
  return React.forwardRef((props: any, ref: any) => {
    let Target = Component;
    while (
      Target &&
      typeof Target === "object" &&
      Target.default &&
      Target.$$typeof === undefined
    ) {
      Target = Target.default;
    }
    if (
      !Target ||
      (typeof Target !== "function" && typeof Target !== "string" && !Target.$$typeof)
    ) {
      Target = "View";
    }
    const theme = unistyles.UnistylesRuntime?.getTheme?.() || {};
    const mapped = mapper ? mapper(theme, unistyles.UnistylesRuntime) : {};
    return React.createElement(Target, { ...mapped, ...props, ref });
  });
};

// Mock NativeEventEmitter
jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter");

// Mock Reanimated
jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  const createAnimatedComponent = (Component: any) => {
    return React.forwardRef((props: any, ref: any) => {
      const { animatedProps, ...rest } = props;
      return React.createElement(Component, { ...rest, ...animatedProps, ref });
    });
  };

  return {
    __esModule: true,
    default: {
      View: React.forwardRef((props: any, ref: any) =>
        React.createElement(View, { ...props, ref }),
      ),
      Text: React.forwardRef((props: any, ref: any) =>
        React.createElement(Text, { ...props, ref }),
      ),
      createAnimatedComponent,
    },
    View: React.forwardRef((props: any, ref: any) => React.createElement(View, { ...props, ref })),
    Text: React.forwardRef((props: any, ref: any) => React.createElement(Text, { ...props, ref })),
    createAnimatedComponent,
    useSharedValue: (val: any) => ({ value: val }),
    useAnimatedStyle: (fn: () => any) => fn() || {},
    useAnimatedProps: (fn: () => any) => fn() || {},
    withTiming: (toValue: any) => toValue,
    withSpring: (toValue: any) => toValue,
    withSequence: (...animations: any[]) => animations[animations.length - 1],
    withRepeat: (anim: any) => anim,
    withDelay: (_: number, anim: any) => anim,
    interpolate: (val: number, [inMin, inMax]: number[], [outMin, outMax]: number[]) => {
      if (inMax === inMin) return outMin;
      return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
    },
    Extrapolation: {
      CLAMP: "clamp",
      IDENTITY: "identity",
      EXTEND: "extend",
    },
    runOnJS: (fn: any) => fn,
    runOnUI: (fn: any) => fn,
  };
});

// Mock expo-router
export const mockRouter = {
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
  dismiss: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  setParams: jest.fn(),
};

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
}));
