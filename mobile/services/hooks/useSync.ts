import { useEffect } from "react";
import { queryClient } from "@/lib/ReactQuery";
import { useAuthStore } from "@/store/useAuthStore";
import { useSyncStore } from "@/store/useSyncStore";
import { nowDate } from "@/utils/Date";
import Logger from "../logger";
import { SyncService } from "../SyncService";

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
        setLastSyncTime(nowDate());
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
  }, [isLoggedIn, setLastSyncTime, setIsSyncing]); // Re-run when login status changes
};
