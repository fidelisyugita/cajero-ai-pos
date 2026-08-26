import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getStore } from "@/services/endpoints/getStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";

export const STORE_QUERY_KEY = ["store"];

export const useStoreQuery = () => {
  const { user } = useAuthStore();
  const storeId = user?.storeId;

  const query = useQuery({
    queryKey: [...STORE_QUERY_KEY, storeId],
    queryFn: () => getStore(storeId!),
    enabled: !!storeId,
  });

  // Sync with persistent store
  useEffect(() => {
    if (query.data) {
      useBusinessStore.getState().setBusiness(query.data);
    }
  }, [query.data]);

  return query;
};
