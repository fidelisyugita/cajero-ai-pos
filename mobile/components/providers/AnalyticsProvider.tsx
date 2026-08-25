import { PostHogProvider } from "posthog-react-native";
import type React from "react";
import { useAuthTracking } from "@/hooks/useAuthTracking";
import { useScreenTracking } from "@/hooks/useScreenTracking";
import { isPostHogEnabled, posthogClient } from "@/lib/posthog";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

const AnalyticsTracker = () => {
  useAuthTracking();
  useScreenTracking();
  return null;
};

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  if (isPostHogEnabled && posthogClient) {
    return (
      <PostHogProvider client={posthogClient} autocapture={false}>
        <AnalyticsTracker />
        {children}
      </PostHogProvider>
    );
  }

  return (
    <>
      <AnalyticsTracker />
      {children}
    </>
  );
};

export default AnalyticsProvider;
