import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";
import zustandStorage from "@/lib/Storage";

export interface OrderItemVariant {
	groupId: string;
	optionId: string;
	name: string;
	price: number;
}

export interface OrderItem {
	id: string;
	productId: string;
	name: string;
	sellingPrice: number;
	imageUrl?: string;
	quantity: number;
	variants: OrderItemVariant[];
	note?: string;
	discount?: number;
	tax?: number;
	commission?: number;
}

interface OrderState {
	items: OrderItem[];
	customerName: string;
	tableNumber: string;
	discount: number;

	addItem: (item: Omit<OrderItem, "id">) => void;
	updateItem: (item: OrderItem) => void;
	removeItem: (itemId: string) => void;
	updateQuantity: (itemId: string, delta: number) => void;
	setCustomerName: (name: string) => void;
	setTableNumber: (num: string) => void;
	setDiscount: (amount: number) => void;
	clearOrder: () => void;
}

export const useOrderStore = create<OrderState>()(
	persist(
		(set) => ({
			items: [],
			customerName: "",
			tableNumber: "",
			discount: 0,

			addItem: (newItem) =>
				set((state) => {
					const id = Math.random().toString(36).substring(2, 9);
					return { items: [...state.items, { ...newItem, id }] };
				}),

			updateItem: (updatedItem) =>
				set((state) => ({
					items: state.items.map((item) =>
						item.id === updatedItem.id ? updatedItem : item,
					),
				})),

			removeItem: (itemId) =>
				set((state) => ({
					items: state.items.filter((i) => i.id !== itemId),
				})),

			updateQuantity: (itemId, delta) =>
				set((state) => ({
					items: state.items.map((i) => {
						if (i.id === itemId) {
							const newQuantity = Math.max(1, i.quantity + delta);
							return { ...i, quantity: newQuantity };
						}
						return i;
					}),
				})),

			setCustomerName: (name) => set({ customerName: name }),
			setTableNumber: (num) => set({ tableNumber: num }),
			setDiscount: (amount) => set({ discount: amount }),
			clearOrder: () =>
				set({ items: [], customerName: "", tableNumber: "", discount: 0 }),
		}),
		{
			name: "cajero-order-storage",
			storage: createJSONStorage(() => zustandStorage),
		},
	),
);

export const selectSubtotal = (items: OrderItem[]) =>
	items.reduce((total, item) => {
		const variantTotal = item.variants.reduce((vt, v) => vt + v.price, 0);
		// Basic price + variants * quantity
		return total + (item.sellingPrice + variantTotal) * item.quantity;
	}, 0);

export const selectTotalItems = (items: OrderItem[]) =>
	items.reduce((count, item) => count + item.quantity, 0);
