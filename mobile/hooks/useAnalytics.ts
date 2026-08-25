import { useCallback } from "react";
import {
  captureAnalyticsEvent,
  identifyAnalyticsUser,
  isPostHogEnabled,
  resetAnalyticsUser,
  trackAnalyticsScreen,
} from "@/lib/posthog";
import type {
  AnalyticsEventMap,
  AnalyticsEventName,
  ScreenViewProperties,
  UserTraits,
} from "@/types/analytics";

/**
 * Primary analytics hook for instrumenting user and POS cashier interactions.
 * Safe to call anywhere in dev/test/production.
 */
export const useAnalytics = () => {
  const trackEvent = useCallback(
    <E extends AnalyticsEventName>(event: E, properties: AnalyticsEventMap[E]) => {
      captureAnalyticsEvent(event, properties);
    },
    [],
  );

  const identify = useCallback((distinctId: string, traits?: UserTraits) => {
    identifyAnalyticsUser(distinctId, traits);
  }, []);

  const reset = useCallback(() => {
    resetAnalyticsUser();
  }, []);

  const trackScreen = useCallback(
    (screenName: string, properties?: Partial<ScreenViewProperties>) => {
      trackAnalyticsScreen(screenName, properties);
    },
    [],
  );

  return {
    trackEvent,
    identify,
    reset,
    trackScreen,
    isEnabled: isPostHogEnabled,
  };
};

export default useAnalytics;
