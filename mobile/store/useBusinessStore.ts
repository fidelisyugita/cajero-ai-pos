import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import zustandStorage from "@/lib/Storage";

export interface Business {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  subscriptionStatus?: 'free' | 'pro' | 'ultra' | 'past_due';
  subscriptionPlanId?: string;
  subscriptionExpiresAt?: string;
  maxDiscount?: number;
  // Add other fields as needed based on API response
}

interface BusinessState {
  business: Business | null;
  setBusiness: (business: Business | null) => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      business: null,
      setBusiness: (business) => set({ business }),
    }),
    {
      name: "business-storage",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
