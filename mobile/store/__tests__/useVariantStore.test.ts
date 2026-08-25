import { useVariantStore, type VariantDraft } from "../useVariantStore";

describe("useVariantStore", () => {
  beforeEach(() => {
    useVariantStore.getState().reset();
  });

  it("should initialize with default state", () => {
    const state = useVariantStore.getState();
    expect(state.variants).toEqual([]);
    expect(state.selectedVariant).toBeNull();
    expect(state.deletedVariantIds).toEqual([]);
  });

  it("should set variants and reset deletedVariantIds", () => {
    const variants: VariantDraft[] = [
      {
        id: "var-1",
        name: "Size",
        isRequired: true,
        isMultiple: false,
        options: [
          { id: "opt-1", name: "Regular", priceAdjusment: 0, stock: 100 },
          { id: "opt-2", name: "Large", priceAdjusment: 5000, stock: 100 },
        ],
      },
    ];

    useVariantStore.getState().setVariants(variants);
    expect(useVariantStore.getState().variants).toEqual(variants);
    expect(useVariantStore.getState().deletedVariantIds).toEqual([]);
  });

  it("should add a new variant", () => {
    const variant: VariantDraft = {
      id: "var-new-1",
      isNew: true,
      name: "Sugar Level",
      isRequired: false,
      isMultiple: false,
      options: [{ id: "opt-1", name: "Normal", priceAdjusment: 0, stock: 50 }],
    };

    useVariantStore.getState().addVariant(variant);
    expect(useVariantStore.getState().variants).toEqual([variant]);
  });

  it("should update an existing variant by id", () => {
    const variant1: VariantDraft = {
      id: "var-1",
      name: "Size",
      isRequired: true,
      isMultiple: false,
      options: [],
    };
    const variant2: VariantDraft = {
      id: "var-2",
      name: "Ice Level",
      isRequired: false,
      isMultiple: false,
      options: [],
    };
    useVariantStore.getState().addVariant(variant1);
    useVariantStore.getState().addVariant(variant2);

    const updatedVariant: VariantDraft = {
      ...variant1,
      name: "Cup Size",
      isRequired: false,
    };

    useVariantStore.getState().updateVariant("var-1", updatedVariant);
    expect(useVariantStore.getState().variants[0].name).toBe("Cup Size");
    expect(useVariantStore.getState().variants[0].isRequired).toBe(false);
    expect(useVariantStore.getState().variants[1].name).toBe("Ice Level");
  });

  it("should track deletedVariantIds when removing an existing (non-new) variant", () => {
    const existingVariant: VariantDraft = {
      id: "existing-var-1",
      isNew: false,
      name: "Milk Type",
      isRequired: false,
      isMultiple: false,
      options: [],
    };
    const newVariant: VariantDraft = {
      id: "temp-var-2",
      isNew: true,
      name: "Extra Shots",
      isRequired: false,
      isMultiple: false,
      options: [],
    };

    useVariantStore.getState().addVariant(existingVariant);
    useVariantStore.getState().addVariant(newVariant);

    // Remove existing variant -> added to deletedVariantIds
    useVariantStore.getState().removeVariant("existing-var-1");
    expect(useVariantStore.getState().variants.length).toBe(1);
    expect(useVariantStore.getState().deletedVariantIds).toEqual(["existing-var-1"]);

    // Remove new variant -> NOT added to deletedVariantIds
    useVariantStore.getState().removeVariant("temp-var-2");
    expect(useVariantStore.getState().variants.length).toBe(0);
    expect(useVariantStore.getState().deletedVariantIds).toEqual(["existing-var-1"]);
  });

  it("should select a variant for editing and reset store", () => {
    const variant: VariantDraft = {
      id: "var-1",
      name: "Topping",
      isRequired: false,
      isMultiple: true,
      options: [],
    };

    useVariantStore.getState().selectVariant(variant);
    expect(useVariantStore.getState().selectedVariant).toEqual(variant);

    useVariantStore.getState().reset();
    expect(useVariantStore.getState().variants).toEqual([]);
    expect(useVariantStore.getState().selectedVariant).toBeNull();
    expect(useVariantStore.getState().deletedVariantIds).toEqual([]);
  });
});
