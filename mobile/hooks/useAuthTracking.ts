import { useEffect } from "react";
import { identifyAnalyticsUser, resetAnalyticsUser } from "@/lib/posthog";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Synchronizes PostHog user identification lifecycle with the global authentication store.
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
    } else if (!isLoggedIn) {
      resetAnalyticsUser();
    }
  }, [isLoggedIn, user]);
};

export default useAuthTracking;
