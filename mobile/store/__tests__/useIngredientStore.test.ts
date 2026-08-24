import { useIngredientStore } from "../useIngredientStore";

describe("useIngredientStore", () => {
  beforeEach(() => {
    useIngredientStore.getState().reset();
  });

  it("should initialize with default state", () => {
    const state = useIngredientStore.getState();
    expect(state.selectedIngredient).toBeNull();
    expect(state.saveCallback).toBeNull();
    expect(state.newIngredientName).toBe("");
  });

  it("should toggle select ingredient (add when not present, remove when present)", () => {
    const ingredient1 = {
      id: "ing-1",
      name: "Coffee Beans",
      measureUnitName: "gram",
    };
    const ingredient2 = {
      id: "ing-2",
      name: "Fresh Milk",
      measureUnitName: "ml",
    };

    // Add first ingredient
    useIngredientStore.getState().selectIngredient(ingredient1);
    expect(useIngredientStore.getState().selectedIngredient).toEqual([
      { ...ingredient1, quantityNeeded: 1 },
    ]);

    // Add second ingredient
    useIngredientStore.getState().selectIngredient(ingredient2);
    expect(useIngredientStore.getState().selectedIngredient?.length).toBe(2);

    // Deselect first ingredient
    useIngredientStore.getState().selectIngredient(ingredient1);
    expect(useIngredientStore.getState().selectedIngredient).toEqual([
      { ...ingredient2, quantityNeeded: 1 },
    ]);

    // Deselect second ingredient -> resets to null
    useIngredientStore.getState().selectIngredient(ingredient2);
    expect(useIngredientStore.getState().selectedIngredient).toBeNull();
  });

  it("should do nothing when selectIngredient is called with null", () => {
    useIngredientStore.getState().selectIngredient(null);
    expect(useIngredientStore.getState().selectedIngredient).toBeNull();
  });

  it("should set selected ingredients array directly", () => {
    const ingredients = [
      { id: "ing-1", name: "Sugar", measureUnitName: "gram", quantityNeeded: 10 },
    ];

    useIngredientStore.getState().setSelectedIngredients(ingredients);
    expect(useIngredientStore.getState().selectedIngredient).toEqual(ingredients);

    // Setting empty array sets null
    useIngredientStore.getState().setSelectedIngredients([]);
    expect(useIngredientStore.getState().selectedIngredient).toBeNull();
  });

  it("should update quantity for a selected ingredient and handle null or non-matching id", () => {
    // When selectedIngredient is null
    useIngredientStore.getState().updateQuantity("non-existent", 5);
    expect(useIngredientStore.getState().selectedIngredient).toEqual([]);

    useIngredientStore.getState().selectIngredient({
      id: "ing-1",
      name: "Syrup",
      measureUnitName: "pump",
    });
    useIngredientStore.getState().selectIngredient({
      id: "ing-2",
      name: "Milk",
      measureUnitName: "ml",
    });

    useIngredientStore.getState().updateQuantity("ing-1", 3);
    const selected = useIngredientStore.getState().selectedIngredient;
    expect(selected?.[0].quantityNeeded).toBe(3);
    expect(selected?.[1].quantityNeeded).toBe(1);
  });

  it("should call saveCallback with selected ingredients when saveIngredient is called, and do nothing if callback is null", () => {
    // Calling saveIngredient without callback should not throw
    expect(() => useIngredientStore.getState().saveIngredient()).not.toThrow();

    const mockCallback = jest.fn();
    useIngredientStore.getState().setSaveCallback(mockCallback);

    const ingredient = {
      id: "ing-1",
      name: "Flour",
      measureUnitName: "kg",
    };
    useIngredientStore.getState().selectIngredient(ingredient);

    useIngredientStore.getState().saveIngredient();
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith([{ ...ingredient, quantityNeeded: 1 }]);
  });

  it("should set newIngredientName and reset state", () => {
    useIngredientStore.getState().setNewIngredientName("Vanilla Extract");
    expect(useIngredientStore.getState().newIngredientName).toBe("Vanilla Extract");

    useIngredientStore.getState().reset();
    expect(useIngredientStore.getState().newIngredientName).toBe("");
    expect(useIngredientStore.getState().selectedIngredient).toBeNull();
    expect(useIngredientStore.getState().saveCallback).toBeNull();
  });
});
