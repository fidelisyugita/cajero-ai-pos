import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createEncryptedMMKV } from "@/lib/Storage";
import type { OrderItem } from "./useOrderStore";

export const storage = createEncryptedMMKV("cajero-draft-storage");

export interface DraftOrder {
  id: string;
  items: OrderItem[];
  customerName: string;
  tableNumber: string;
  discount: number;
  savedAt: number;
}

interface DraftState {
  drafts: DraftOrder[];

  addDraft: (order: Omit<DraftOrder, "id" | "savedAt">) => void;
  removeDraft: (draftId: string) => void;
  clearDrafts: () => void;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      drafts: [],

      addDraft: (order) =>
        set((state) => {
          const id = Math.random().toString(36).substring(2, 9);
          const newDraft: DraftOrder = {
            ...order,
            id,
            savedAt: Date.now(),
          };
          return { drafts: [...state.drafts, newDraft] };
        }),

      removeDraft: (draftId) =>
        set((state) => ({
          drafts: state.drafts.filter((d) => d.id !== draftId),
        })),

      clearDrafts: () => set({ drafts: [] }),
    }),
    {
      name: "cajero-draft-storage",
      storage: createJSONStorage(() => storage),
    },
  ),
);
