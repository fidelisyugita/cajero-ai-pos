import { useEffect } from "react";
import { SyncService } from "../SyncService";
import { useAuthStore } from "@/store/useAuthStore";
import { useSyncStore } from "@/store/useSyncStore";
import { queryClient } from "@/lib/ReactQuery";
import Logger from "../logger";

export const useSync = () => {
  const { isLoggedIn } = useAuthStore();
  const { setIsSyncing, setLastSyncTime } = useSyncStore();

  useEffect(() => {
    const sync = async () => {
      if (!isLoggedIn) return; // Don't sync if not logged in

      Logger.log("Starting sync...");
      setIsSyncing(true);
      try {
        await SyncService.syncAll();
        setLastSyncTime(new Date());
        Logger.log("Sync completed");
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      } catch (error) {
        Logger.error("Sync failed", error);
      } finally {
        setIsSyncing(false);
      }
    };

    sync();

    // Interval sync (only if logged in)
    const interval = setInterval(sync, 5 * 60 * 1000); // 5 mins
    return () => clearInterval(interval);
  }, [isLoggedIn]); // Re-run when login status changes
};
