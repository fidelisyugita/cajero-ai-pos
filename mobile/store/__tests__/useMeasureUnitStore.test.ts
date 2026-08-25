import { useMeasureUnitStore } from "../useMeasureUnitStore";

describe("useMeasureUnitStore", () => {
  beforeEach(() => {
    useMeasureUnitStore.getState().reset();
  });

  it("should initialize with default state", () => {
    const state = useMeasureUnitStore.getState();
    expect(state.selectedMeasureUnit).toBeNull();
    expect(state.saveCallback).toBeNull();
    expect(state.newMeasureUnitName).toBe("");
    expect(state.newMeasureUnitCode).toBe("");
  });

  it("should select a measure unit", () => {
    const unit = { name: "Kilogram", code: "KG" };
    useMeasureUnitStore.getState().selectMeasureUnit(unit);
    expect(useMeasureUnitStore.getState().selectedMeasureUnit).toEqual(unit);
  });

  it("should trigger saveCallback with selectedMeasureUnit on saveMeasureUnit, or do nothing if null", () => {
    // Without callback
    expect(() => useMeasureUnitStore.getState().saveMeasureUnit()).not.toThrow();

    const mockCallback = jest.fn();
    const unit = { name: "Liter", code: "LTR" };

    useMeasureUnitStore.getState().setSaveCallback(mockCallback);
    useMeasureUnitStore.getState().selectMeasureUnit(unit);

    useMeasureUnitStore.getState().saveMeasureUnit();
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(unit);
  });

  it("should set newMeasureUnitName and newMeasureUnitCode", () => {
    useMeasureUnitStore.getState().setNewMeasureUnitName("Gram");
    useMeasureUnitStore.getState().setNewMeasureUnitCode("GR");

    expect(useMeasureUnitStore.getState().newMeasureUnitName).toBe("Gram");
    expect(useMeasureUnitStore.getState().newMeasureUnitCode).toBe("GR");
  });

  it("should reset state completely", () => {
    useMeasureUnitStore.getState().selectMeasureUnit({ name: "Gram", code: "GR" });
    useMeasureUnitStore.getState().setNewMeasureUnitName("Gram");
    useMeasureUnitStore.getState().setNewMeasureUnitCode("GR");
    useMeasureUnitStore.getState().setSaveCallback(jest.fn());

    useMeasureUnitStore.getState().reset();

    const state = useMeasureUnitStore.getState();
    expect(state.selectedMeasureUnit).toBeNull();
    expect(state.saveCallback).toBeNull();
    expect(state.newMeasureUnitName).toBe("");
    expect(state.newMeasureUnitCode).toBe("");
  });
});
