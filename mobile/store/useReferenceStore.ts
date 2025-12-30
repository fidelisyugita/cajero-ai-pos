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

export const useReferenceStore = create<ReferenceState>()(
	persist(
		(set) => ({
			transactionTypes: [],
			paymentMethods: [],
			transactionStatuses: [],
			fetchAll: async () => {
				const [transactionTypes, paymentMethods, transactionStatuses] =
					await Promise.all([
						getTransactionTypes(),
						getPaymentMethods(),
						getTransactionStatuses(),
					]);
				set({ transactionTypes, paymentMethods, transactionStatuses });
			},
		}),
		{
			name: "reference-storage",
			storage: createJSONStorage(() => zustandStorage),
		},
	),
);
