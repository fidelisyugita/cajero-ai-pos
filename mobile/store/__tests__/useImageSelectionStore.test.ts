import useImageSelectionStore from "../useImageSelectionStore";

describe("useImageSelectionStore", () => {
  beforeEach(() => {
    useImageSelectionStore.getState().reset();
  });

  it("should initialize with default state", () => {
    const state = useImageSelectionStore.getState();
    expect(state.imageUri).toBe("");
    expect(state.onImageUploaded).toBeUndefined();
  });

  it("should set image uri", () => {
    useImageSelectionStore.getState().setImageUri("file:///path/to/image.png");
    expect(useImageSelectionStore.getState().imageUri).toBe("file:///path/to/image.png");
  });

  it("should set onImageUploaded callback and trigger it", () => {
    const mockCallback = jest.fn();
    useImageSelectionStore.getState().setOnImageUploaded(mockCallback);

    const callback = useImageSelectionStore.getState().onImageUploaded;
    expect(callback).toBe(mockCallback);

    callback?.("file:///path/to/uploaded.png");
    expect(mockCallback).toHaveBeenCalledWith("file:///path/to/uploaded.png");
  });

  it("should reset state", () => {
    useImageSelectionStore.getState().setImageUri("file:///path/to/image.png");
    useImageSelectionStore.getState().setOnImageUploaded(jest.fn());

    useImageSelectionStore.getState().reset();
    const state = useImageSelectionStore.getState();
    expect(state.imageUri).toBe("");
    expect(state.onImageUploaded).toBeUndefined();
  });
});
