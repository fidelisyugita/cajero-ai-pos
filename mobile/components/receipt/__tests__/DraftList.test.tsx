import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";
import { mockRouter } from "@/jest.setup";
import { type DraftOrder, useDraftStore } from "@/store/useDraftStore";
import { useOrderStore } from "@/store/useOrderStore";
import { toDayjs } from "@/utils/Date";
import { formatCurrency } from "@/utils/Format";
import DraftList from "../DraftList";

describe("DraftList component", () => {
  const sampleDrafts: DraftOrder[] = [
    {
      id: "DRAFT-101",
      savedAt: toDayjs("2026-08-25T14:30:00.000Z").valueOf(),
      customerName: "Bob Smith",
      tableNumber: "5",
      discount: 2000,
      items: [
        {
          id: "item-1",
          productId: "prod-1",
          name: "Cappuccino",
          sellingPrice: 30000,
          quantity: 2,
          discount: 0,
          variants: [
            { groupId: "g-1", groupName: "Milk", optionId: "opt-1", name: "Oat Milk", price: 5000 },
          ],
        },
      ],
    },
    {
      id: "DRAFT-102",
      savedAt: toDayjs("2026-08-25T15:00:00.000Z").valueOf(),
      customerName: "Charlie Brown",
      tableNumber: "",
      discount: 0,
      items: [
        {
          id: "item-2",
          productId: "prod-2",
          name: "Butter Croissant",
          sellingPrice: 20000,
          quantity: 1,
          discount: 0,
          variants: [],
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useDraftStore.setState({ drafts: sampleDrafts });
    useOrderStore.setState({ items: [], customerName: "", tableNumber: "", discount: 0 });
    jest.spyOn(Alert, "alert");
  });

  it("renders draft rows with ID, customer/table, item count, and calculated total", async () => {
    await render(<DraftList />);

    expect(screen.getByText("DRAFT-101")).toBeTruthy();
    expect(screen.getByText("Bob Smith - Table 5")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    // Subtotal: (30000 + 5000) * 2 = 70000 - 2000 (discount) = 68000
    expect(screen.getByText(formatCurrency(68000))).toBeTruthy();

    expect(screen.getByText("DRAFT-102")).toBeTruthy();
    expect(screen.getByText("Charlie Brown")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText(formatCurrency(20000))).toBeTruthy();
  });

  it("filters drafts based on searchQuery matching ID, customer name, or table number", async () => {
    const { rerender } = await render(<DraftList searchQuery="101" />);

    expect(screen.getByText("DRAFT-101")).toBeTruthy();
    expect(screen.queryByText("DRAFT-102")).toBeNull();

    await rerender(<DraftList searchQuery="Charlie" />);
    expect(screen.getByText("DRAFT-102")).toBeTruthy();
    expect(screen.queryByText("DRAFT-101")).toBeNull();

    await rerender(<DraftList searchQuery="5" />);
    expect(screen.getByText("DRAFT-101")).toBeTruthy();
    expect(screen.queryByText("DRAFT-102")).toBeNull();
  });

  it("renders EmptyState when drafts list is empty or search yields no results", async () => {
    useDraftStore.setState({ drafts: [] });
    await render(<DraftList />);

    expect(screen.getByText("No Drafts Found")).toBeTruthy();
  });

  it("resumes draft immediately when cart is empty and navigates to menu", async () => {
    await render(<DraftList />);

    const resumeButtons = screen.getAllByText("Resume");
    await act(async () => {
      fireEvent.press(resumeButtons[0]);
    });

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(useOrderStore.getState().customerName).toBe("Bob Smith");
    expect(useOrderStore.getState().tableNumber).toBe("5");
    expect(useOrderStore.getState().discount).toBe(2000);
    expect(useOrderStore.getState().items.length).toBe(1);
    expect(useOrderStore.getState().items[0].name).toBe("Cappuccino");

    // Draft should be removed from useDraftStore
    expect(useDraftStore.getState().drafts.find((d) => d.id === "DRAFT-101")).toBeUndefined();
    expect(mockRouter.push).toHaveBeenCalledWith("/(dashboard)/menu");
  });

  it("shows overwrite warning alert when active cart items exist, and resumes on confirmation", async () => {
    useOrderStore.setState({
      items: [
        {
          id: "active-item",
          productId: "prod-99",
          name: "Existing Item",
          sellingPrice: 15000,
          quantity: 1,
          variants: [],
        },
      ],
    });

    await render(<DraftList />);

    const resumeButtons = screen.getAllByText("Resume");
    await act(async () => {
      fireEvent.press(resumeButtons[1]);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Overwrite current order?",
      "You have active items in your cart. Resuming this draft will clear them.",
      expect.any(Array),
    );

    // Trigger Overwrite button in the Alert dialog
    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const overwriteAction = alertButtons.find((btn: any) => btn.text === "Overwrite");
    expect(overwriteAction).toBeTruthy();

    await act(async () => {
      overwriteAction.onPress();
    });

    expect(useOrderStore.getState().customerName).toBe("Charlie Brown");
    expect(useOrderStore.getState().items.length).toBe(1);
    expect(useOrderStore.getState().items[0].name).toBe("Butter Croissant");
    expect(useDraftStore.getState().drafts.find((d) => d.id === "DRAFT-102")).toBeUndefined();
    expect(mockRouter.push).toHaveBeenCalledWith("/(dashboard)/menu");
  });
});
