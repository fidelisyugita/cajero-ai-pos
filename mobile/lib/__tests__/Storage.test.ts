import zustandStorage, { clearAllStorage } from "../Storage";

describe("Storage lib", () => {
  beforeEach(() => {
    clearAllStorage();
  });

  it("sets, gets, and removes string items correctly via zustandStorage", () => {
    expect(zustandStorage.getItem("test-key")).toBeNull();

    zustandStorage.setItem("test-key", "test-value");
    expect(zustandStorage.getItem("test-key")).toBe("test-value");

    zustandStorage.removeItem("test-key");
    expect(zustandStorage.getItem("test-key")).toBeNull();
  });

  it("returns null when item is not found", () => {
    expect(zustandStorage.getItem("non-existent-key")).toBeNull();
  });

  it("clears all storage entries when clearAllStorage is called", () => {
    zustandStorage.setItem("key-1", "value-1");
    zustandStorage.setItem("key-2", "value-2");

    expect(zustandStorage.getItem("key-1")).toBe("value-1");
    expect(zustandStorage.getItem("key-2")).toBe("value-2");

    clearAllStorage();

    expect(zustandStorage.getItem("key-1")).toBeNull();
    expect(zustandStorage.getItem("key-2")).toBeNull();
  });
});
