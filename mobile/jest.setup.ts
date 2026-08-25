import "react-native-unistyles/mocks";
import { cleanup } from "@testing-library/react-native";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import localeData from "dayjs/plugin/localeData";
import localizedFormat from "dayjs/plugin/localizedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import "./config/Unistyles";

dayjs.extend(localeData);
dayjs.extend(weekday);
dayjs.extend(isBetween);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(utc);
dayjs.extend(timezone);

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
  router: mockRouter,
  useRouter: () => mockRouter,
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: () => [],
  Stack: {
    Screen: () => null,
  },
  Redirect: jest.fn((_props: { href: string }) => null),
  SplashScreen: {
    hideAsync: jest.fn().mockResolvedValue(true),
    preventAutoHideAsync: jest.fn().mockResolvedValue(true),
  },
}));

// Mock react-native-mmkv
jest.mock("react-native-mmkv", () => {
  return {
    MMKV: jest.fn().mockImplementation(() => {
      const storage = new Map<string, any>();
      return {
        set: jest.fn((key: string, value: any) => {
          storage.set(key, value);
        }),
        getString: jest.fn((key: string) => {
          const val = storage.get(key);
          return typeof val === "string" ? val : undefined;
        }),
        getNumber: jest.fn((key: string) => {
          const val = storage.get(key);
          return typeof val === "number" ? val : undefined;
        }),
        getBoolean: jest.fn((key: string) => {
          const val = storage.get(key);
          return typeof val === "boolean" ? val : undefined;
        }),
        delete: jest.fn((key: string) => {
          storage.delete(key);
        }),
        clearAll: jest.fn(() => {
          storage.clear();
        }),
        contains: jest.fn((key: string) => storage.has(key)),
        getAllKeys: jest.fn(() => Array.from(storage.keys())),
      };
    }),
  };
});

jest.mock("@/services/endpoints/references", () => ({
  getTransactionTypes: jest.fn().mockResolvedValue([]),
  getPaymentMethods: jest.fn().mockResolvedValue([]),
  getTransactionStatuses: jest.fn().mockResolvedValue([]),
}));

jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    closeSync: jest.fn(),
  })),
}));

jest.mock("drizzle-orm/expo-sqlite", () => ({
  drizzle: jest.fn(() => ({
    $client: {
      close: jest.fn(),
    },
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  })),
}));

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  const insets = { top: 0, left: 0, right: 0, bottom: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => React.createElement(View, null, children),
    SafeAreaView: ({ children, ...props }: any) => React.createElement(View, props, children),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});
