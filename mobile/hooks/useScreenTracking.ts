import { usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { trackAnalyticsScreen } from "@/lib/posthog";

/**
 * Automatically captures screen transitions in Expo Router navigation.
 */
export const useScreenTracking = (): void => {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === previousPathnameRef.current) return;

    previousPathnameRef.current = pathname;

    // Clean up raw segment formatting for clearer analytics reporting
    const screenName =
      pathname
        .replace(/^\//, "")
        .replace(/\(.*?\)\/?/g, "")
        .replace(/\/$/, "") || "home";

    trackAnalyticsScreen(screenName, {
      screenName,
      path: pathname,
    });
  }, [pathname]);
};

export default useScreenTracking;
