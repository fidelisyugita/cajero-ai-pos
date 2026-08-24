import { useCategoryStore } from "../useMenuCategoryStore";

describe("useMenuCategoryStore", () => {
  beforeEach(() => {
    useCategoryStore.getState().clearSelectedCategory();
  });

  it("should initialize with ALL category and empty search query", () => {
    const state = useCategoryStore.getState();
    expect(state.selectedCategory).toBe("ALL");
    expect(state.searchQuery).toBe("");
  });

  it("should set search query", () => {
    useCategoryStore.getState().setSearchQuery("Cappuccino");
    expect(useCategoryStore.getState().searchQuery).toBe("Cappuccino");
  });

  it("should set category and clear search query simultaneously", () => {
    useCategoryStore.getState().setSearchQuery("Latte");
    expect(useCategoryStore.getState().searchQuery).toBe("Latte");

    useCategoryStore.getState().setSelectedCategory("COFFEE");
    expect(useCategoryStore.getState().selectedCategory).toBe("COFFEE");
    expect(useCategoryStore.getState().searchQuery).toBe("");
  });

  it("should clear selected category back to ALL and clear search query", () => {
    useCategoryStore.getState().setSelectedCategory("SNACKS");
    useCategoryStore.getState().setSearchQuery("Chips");

    useCategoryStore.getState().clearSelectedCategory();
    expect(useCategoryStore.getState().selectedCategory).toBe("ALL");
    expect(useCategoryStore.getState().searchQuery).toBe("");
  });
});
