import type { StoreApi, UseBoundStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

export function useStoreShallow<TState, TSelected>(
	store: UseBoundStore<StoreApi<TState>>,
	selector: (state: TState) => TSelected,
): TSelected {
	return store(useShallow(selector)) as TSelected;
}
