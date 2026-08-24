import { AI_MODELS, useAIStore } from "../useAIStore";

describe("useAIStore", () => {
  beforeEach(() => {
    useAIStore.setState({ selectedModel: "llama-3.2-1b" });
  });

  it("should initialize with llama-3.2-1b as default model", () => {
    expect(useAIStore.getState().selectedModel).toBe("llama-3.2-1b");
  });

  it("should update selected AI model", () => {
    useAIStore.getState().setSelectedModel("stories-110m");
    expect(useAIStore.getState().selectedModel).toBe("stories-110m");

    useAIStore.getState().setSelectedModel("llama-3.2-1b");
    expect(useAIStore.getState().selectedModel).toBe("llama-3.2-1b");
  });

  it("should define standard AI_MODELS configurations", () => {
    expect(AI_MODELS["llama-3.2-1b"]).toBeDefined();
    expect(AI_MODELS["llama-3.2-1b"].id).toBe("llama-3.2-1b");
    expect(AI_MODELS["llama-3.2-1b"].isTiny).toBe(false);

    expect(AI_MODELS["stories-110m"]).toBeDefined();
    expect(AI_MODELS["stories-110m"].id).toBe("stories-110m");
    expect(AI_MODELS["stories-110m"].isTiny).toBe(true);
  });
});
