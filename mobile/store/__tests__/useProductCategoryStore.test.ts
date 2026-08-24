import { useCategoryStore } from "../useProductCategoryStore";

describe("useProductCategoryStore", () => {
  beforeEach(() => {
    useCategoryStore.getState().reset();
  });

  it("should initialize with default state", () => {
    const state = useCategoryStore.getState();
    expect(state.selectedCategory).toBeNull();
    expect(state.saveCallback).toBeNull();
    expect(state.newCategoryName).toBe("");
  });

  it("should select a category", () => {
    const category = { name: "Beverages", code: "BEV" };
    useCategoryStore.getState().selectCategory(category);
    expect(useCategoryStore.getState().selectedCategory).toEqual(category);
  });

  it("should trigger saveCallback with selected category on saveCategory, or do nothing if null", () => {
    // Without callback
    expect(() => useCategoryStore.getState().saveCategory()).not.toThrow();

    const mockCallback = jest.fn();
    const category = { name: "Bakery", code: "BAK" };

    useCategoryStore.getState().setSaveCallback(mockCallback);
    useCategoryStore.getState().selectCategory(category);

    useCategoryStore.getState().saveCategory();
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(category);
  });

  it("should update new category name and reset", () => {
    useCategoryStore.getState().setNewCategoryName("Dessert");
    expect(useCategoryStore.getState().newCategoryName).toBe("Dessert");

    useCategoryStore.getState().reset();
    expect(useCategoryStore.getState().newCategoryName).toBe("");
    expect(useCategoryStore.getState().selectedCategory).toBeNull();
    expect(useCategoryStore.getState().saveCallback).toBeNull();
  });
});
