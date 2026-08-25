import { type OrderItem, selectSubtotal, selectTotalItems, useOrderStore } from "../useOrderStore";

describe("useOrderStore", () => {
  beforeEach(() => {
    useOrderStore.getState().clearOrder();
  });

  it("should initialize with default empty state", () => {
    const state = useOrderStore.getState();
    expect(state.items).toEqual([]);
    expect(state.customerName).toBe("");
    expect(state.tableNumber).toBe("");
    expect(state.discount).toBe(0);
  });

  it("should add an item to the order and assign a unique id", () => {
    useOrderStore.getState().addItem({
      productId: "prod-1",
      name: "Espresso",
      sellingPrice: 25000,
      quantity: 1,
      variants: [],
    });

    const items = useOrderStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].productId).toBe("prod-1");
    expect(items[0].name).toBe("Espresso");
    expect(items[0].sellingPrice).toBe(25000);
    expect(items[0].id).toBeDefined();
    expect(typeof items[0].id).toBe("string");
  });

  it("should add multiple items", () => {
    useOrderStore.getState().addItem({
      productId: "prod-1",
      name: "Espresso",
      sellingPrice: 25000,
      quantity: 1,
      variants: [],
    });
    useOrderStore.getState().addItem({
      productId: "prod-2",
      name: "Croissant",
      sellingPrice: 30000,
      quantity: 2,
      variants: [],
    });

    const items = useOrderStore.getState().items;
    expect(items.length).toBe(2);
    expect(items[0].name).toBe("Espresso");
    expect(items[1].name).toBe("Croissant");
  });

  it("should update an existing item in the order", () => {
    useOrderStore.getState().addItem({
      productId: "prod-1",
      name: "Latte",
      sellingPrice: 35000,
      quantity: 1,
      variants: [],
    });
    useOrderStore.getState().addItem({
      productId: "prod-2",
      name: "Water",
      sellingPrice: 5000,
      quantity: 1,
      variants: [],
    });

    const addedItem = useOrderStore.getState().items[0];
    const updatedItem: OrderItem = {
      ...addedItem,
      quantity: 3,
      note: "Less ice, oat milk",
      variants: [
        {
          groupId: "grp-1",
          groupName: "Milk",
          optionId: "opt-1",
          name: "Oat Milk",
          price: 5000,
        },
      ],
    };

    useOrderStore.getState().updateItem(updatedItem);

    const items = useOrderStore.getState().items;
    expect(items[0].quantity).toBe(3);
    expect(items[0].note).toBe("Less ice, oat milk");
    expect(items[0].variants.length).toBe(1);
    expect(items[0].variants[0].name).toBe("Oat Milk");
    expect(items[1].name).toBe("Water");
  });

  it("should remove an item by id", () => {
    useOrderStore.getState().addItem({
      productId: "prod-1",
      name: "Item 1",
      sellingPrice: 10000,
      quantity: 1,
      variants: [],
    });
    useOrderStore.getState().addItem({
      productId: "prod-2",
      name: "Item 2",
      sellingPrice: 20000,
      quantity: 1,
      variants: [],
    });

    const firstItemId = useOrderStore.getState().items[0].id;
    useOrderStore.getState().removeItem(firstItemId);

    const items = useOrderStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].productId).toBe("prod-2");
  });

  it("should update quantity and prevent dropping below 1", () => {
    useOrderStore.getState().addItem({
      productId: "prod-1",
      name: "Americano",
      sellingPrice: 20000,
      quantity: 2,
      variants: [],
    });
    useOrderStore.getState().addItem({
      productId: "prod-2",
      name: "Tea",
      sellingPrice: 15000,
      quantity: 1,
      variants: [],
    });

    const items = useOrderStore.getState().items;
    const itemId = items[0].id;

    // Increment first item while second item remains unchanged
    useOrderStore.getState().updateQuantity(itemId, 1);
    expect(useOrderStore.getState().items[0].quantity).toBe(3);
    expect(useOrderStore.getState().items[1].quantity).toBe(1);

    // Decrement
    useOrderStore.getState().updateQuantity(itemId, -1);
    expect(useOrderStore.getState().items[0].quantity).toBe(2);

    // Decrement below 1 should clamp to 1
    useOrderStore.getState().updateQuantity(itemId, -5);
    expect(useOrderStore.getState().items[0].quantity).toBe(1);
  });

  it("should update customerName, tableNumber, and discount", () => {
    useOrderStore.getState().setCustomerName("Jane Doe");
    expect(useOrderStore.getState().customerName).toBe("Jane Doe");

    useOrderStore.getState().setTableNumber("T-12");
    expect(useOrderStore.getState().tableNumber).toBe("T-12");

    useOrderStore.getState().setDiscount(5000);
    expect(useOrderStore.getState().discount).toBe(5000);
  });

  it("should clear the order completely", () => {
    useOrderStore.getState().addItem({
      productId: "prod-1",
      name: "Item",
      sellingPrice: 10000,
      quantity: 1,
      variants: [],
    });
    useOrderStore.getState().setCustomerName("John");
    useOrderStore.getState().setTableNumber("A1");
    useOrderStore.getState().setDiscount(1000);

    useOrderStore.getState().clearOrder();

    const state = useOrderStore.getState();
    expect(state.items).toEqual([]);
    expect(state.customerName).toBe("");
    expect(state.tableNumber).toBe("");
    expect(state.discount).toBe(0);
  });

  describe("selectors", () => {
    it("selectSubtotal should calculate total price including item prices and variant modifiers", () => {
      const items: OrderItem[] = [
        {
          id: "1",
          productId: "p1",
          name: "Latte",
          sellingPrice: 30000,
          quantity: 2,
          variants: [
            {
              groupId: "g1",
              groupName: "Milk",
              optionId: "o1",
              name: "Oat Milk",
              price: 5000,
            },
            {
              groupId: "g2",
              groupName: "Syrup",
              optionId: "o2",
              name: "Vanilla",
              price: 3000,
            },
          ],
        },
        {
          id: "2",
          productId: "p2",
          name: "Cookie",
          sellingPrice: 15000,
          quantity: 1,
          variants: [],
        },
      ];

      // Item 1: (30000 + 5000 + 3000) * 2 = 76000
      // Item 2: 15000 * 1 = 15000
      // Subtotal: 91000
      expect(selectSubtotal(items)).toBe(91000);
    });

    it("selectSubtotal should return 0 for empty item list", () => {
      expect(selectSubtotal([])).toBe(0);
    });

    it("selectTotalItems should sum quantities of all items", () => {
      const items: OrderItem[] = [
        {
          id: "1",
          productId: "p1",
          name: "Item 1",
          sellingPrice: 10000,
          quantity: 3,
          variants: [],
        },
        {
          id: "2",
          productId: "p2",
          name: "Item 2",
          sellingPrice: 20000,
          quantity: 5,
          variants: [],
        },
      ];

      expect(selectTotalItems(items)).toBe(8);
    });

    it("selectTotalItems should return 0 for empty list", () => {
      expect(selectTotalItems([])).toBe(0);
    });
  });
});
