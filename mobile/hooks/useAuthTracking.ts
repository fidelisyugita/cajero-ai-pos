import { useEffect } from "react";
import { identifyAnalyticsUser, resetAnalyticsUser } from "@/lib/posthog";
import { clearSentryUser, setSentryUser } from "@/lib/sentry";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Synchronizes PostHog and Sentry user identification lifecycle with the global authentication store.
 */
export const useAuthTracking = (): void => {
  const { isLoggedIn, user } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      identifyAnalyticsUser(user.id, {
        email: user.email,
        name: user.name,
        storeId: user.storeId,
        roleCode: user.roleCode,
        phone: user.phone,
      });

      setSentryUser({
        id: user.id,
        email: user.email,
        roleCode: user.roleCode,
        storeId: user.storeId,
      });
    } else if (!isLoggedIn) {
      resetAnalyticsUser();
      clearSentryUser();
    }
  }, [isLoggedIn, user]);
};

export default useAuthTracking;
