import { useDraftStore } from "../useDraftStore";

describe("useDraftStore", () => {
  beforeEach(() => {
    useDraftStore.getState().clearDrafts();
  });

  it("should initialize with empty drafts array", () => {
    expect(useDraftStore.getState().drafts).toEqual([]);
  });

  it("should add a draft order with generated id and savedAt timestamp", () => {
    const beforeTime = Date.now();

    useDraftStore.getState().addDraft({
      items: [
        {
          id: "item-1",
          productId: "prod-1",
          name: "Iced Latte",
          sellingPrice: 30000,
          quantity: 2,
          variants: [],
        },
      ],
      customerName: "Alice",
      tableNumber: "Table 4",
      discount: 0,
    });

    const drafts = useDraftStore.getState().drafts;
    expect(drafts.length).toBe(1);
    expect(drafts[0].customerName).toBe("Alice");
    expect(drafts[0].tableNumber).toBe("Table 4");
    expect(drafts[0].items.length).toBe(1);
    expect(drafts[0].id).toBeDefined();
    expect(typeof drafts[0].id).toBe("string");
    expect(drafts[0].savedAt).toBeGreaterThanOrEqual(beforeTime);
  });

  it("should remove a draft order by id", () => {
    useDraftStore.getState().addDraft({
      items: [],
      customerName: "Draft 1",
      tableNumber: "T1",
      discount: 0,
    });
    useDraftStore.getState().addDraft({
      items: [],
      customerName: "Draft 2",
      tableNumber: "T2",
      discount: 0,
    });

    const firstDraftId = useDraftStore.getState().drafts[0].id;
    useDraftStore.getState().removeDraft(firstDraftId);

    const remaining = useDraftStore.getState().drafts;
    expect(remaining.length).toBe(1);
    expect(remaining[0].customerName).toBe("Draft 2");
  });

  it("should clear all drafts", () => {
    useDraftStore.getState().addDraft({
      items: [],
      customerName: "Draft 1",
      tableNumber: "T1",
      discount: 0,
    });
    useDraftStore.getState().addDraft({
      items: [],
      customerName: "Draft 2",
      tableNumber: "T2",
      discount: 0,
    });

    expect(useDraftStore.getState().drafts.length).toBe(2);

    useDraftStore.getState().clearDrafts();
    expect(useDraftStore.getState().drafts).toEqual([]);
  });
});
