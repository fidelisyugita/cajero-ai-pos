import { useLanguageStore } from "../useLanguageStore";

describe("useLanguageStore", () => {
  beforeEach(() => {
    useLanguageStore.setState({ language: "en" });
  });

  it("should default to english language", () => {
    expect(useLanguageStore.getState().language).toBe("en");
  });

  it("should update language to indonesian and back", () => {
    useLanguageStore.getState().setLanguage("id");
    expect(useLanguageStore.getState().language).toBe("id");

    useLanguageStore.getState().setLanguage("en");
    expect(useLanguageStore.getState().language).toBe("en");
  });
});
