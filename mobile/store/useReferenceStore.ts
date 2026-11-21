import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import zustandStorage from "@/lib/Storage";
import {
  getPaymentMethods,
  getTransactionStatuses,
  getTransactionTypes,
} from "@/services/endpoints/references";
import type {
  PaymentMethodRef,
  TransactionStatusRef,
  TransactionTypeRef,
} from "@/services/types/Transaction";

interface ReferenceState {
  transactionTypes: TransactionTypeRef[];
  paymentMethods: PaymentMethodRef[];
  transactionStatuses: TransactionStatusRef[];
  fetchAll: () => Promise<void>;
}

let fetchAllPromise: Promise<void> | null = null;

export const useReferenceStore = create<ReferenceState>()(
  persist(
    (set, get) => ({
      transactionTypes: [],
      paymentMethods: [],
      transactionStatuses: [],
      fetchAll: async () => {
        const { transactionTypes, paymentMethods, transactionStatuses } = get();
        if (
          transactionTypes.length > 0 &&
          paymentMethods.length > 0 &&
          transactionStatuses.length > 0
        ) {
          return;
        }
        if (fetchAllPromise) {
          return fetchAllPromise;
        }
        fetchAllPromise = (async () => {
          try {
            const [types, methods, statuses] = await Promise.all([
              getTransactionTypes(),
              getPaymentMethods(),
              getTransactionStatuses(),
            ]);
            set({
              transactionTypes: types,
              paymentMethods: methods,
              transactionStatuses: statuses,
            });
          } finally {
            fetchAllPromise = null;
          }
        })();
        return fetchAllPromise;
      },
    }),
    {
      name: "reference-storage",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
