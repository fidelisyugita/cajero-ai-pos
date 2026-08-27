import type { PostHogCustomStorage } from "posthog-react-native";
import PostHog from "posthog-react-native";
import { createMMKV } from "react-native-mmkv";
import type {
  AnalyticsEventMap,
  AnalyticsEventName,
  ScreenViewProperties,
  UserTraits,
} from "@/types/analytics";
import { sanitizeTelemetry } from "./sanitizeTelemetry";

const posthogStorage = createMMKV({ id: "cajero-posthog" });

export const mmkvPostHogStorage: PostHogCustomStorage = {
  getItem: (key: string) => {
    try {
      return posthogStorage.getString(key) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      posthogStorage.set(key, value);
    } catch {
      // Fail silently in high-throughput environments
    }
  },
};

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY?.trim() || "";
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";

// Only enable in real production environments with a configured API key
export const isPostHogEnabled =
  !__DEV__ &&
  process.env.NODE_ENV !== "test" &&
  apiKey.length > 0 &&
  apiKey !== "phc_your_production_api_key";

export const posthogClient: PostHog | null = isPostHogEnabled
  ? new PostHog(apiKey, {
      host,
      customStorage: mmkvPostHogStorage,
      captureAppLifecycleEvents: true,
      enableSessionReplay: false,
      flushAt: 20,
      flushInterval: 30000,
    })
  : null;

/**
 * Capture strongly typed POS analytics events.
 * In development or testing, this safely executes as a no-op.
 */
export const captureAnalyticsEvent = <E extends AnalyticsEventName>(
  event: E,
  properties: AnalyticsEventMap[E],
): void => {
  if (!(isPostHogEnabled && posthogClient)) return;

  try {
    const sanitizedProperties = sanitizeTelemetry(properties);
    // biome-ignore lint/suspicious/noExplicitAny: PostHog SDK capture properties definition
    posthogClient.capture(event, sanitizedProperties as Record<string, any>);
  } catch {
    // Suppress analytics dispatch errors to avoid interrupting cashier flows
  }
};

/**
 * Identify the authenticated cashier or store owner in PostHog.
 */
export const identifyAnalyticsUser = (distinctId: string, traits?: UserTraits): void => {
  if (!(isPostHogEnabled && posthogClient)) return;

  try {
    const sanitizedTraits = traits ? sanitizeTelemetry(traits) : undefined;
    // biome-ignore lint/suspicious/noExplicitAny: PostHog SDK identify traits definition
    posthogClient.identify(distinctId, sanitizedTraits as Record<string, any>);
  } catch {
    // Fail silently
  }
};

/**
 * Reset PostHog user identity on logout.
 */
export const resetAnalyticsUser = (): void => {
  if (!(isPostHogEnabled && posthogClient)) return;

  try {
    posthogClient.reset();
  } catch {
    // Fail silently
  }
};

/**
 * Track screen navigation changes.
 */
export const trackAnalyticsScreen = (
  screenName: string,
  properties?: Partial<ScreenViewProperties>,
): void => {
  if (!(isPostHogEnabled && posthogClient)) return;

  try {
    const sanitizedProperties = properties ? sanitizeTelemetry(properties) : undefined;
    // biome-ignore lint/suspicious/noExplicitAny: PostHog SDK screen properties definition
    posthogClient.screen(screenName, sanitizedProperties as Record<string, any>);
  } catch {
    // Fail silently
  }
};

export default posthogClient;
