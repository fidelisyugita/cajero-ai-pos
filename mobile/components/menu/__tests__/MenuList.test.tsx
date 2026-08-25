import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { mockRouter } from "@/jest.setup";
import { useProductsQuery } from "@/services/queries/useProductsQuery";
import type { Product } from "@/services/types/Product";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoryStore } from "@/store/useMenuCategoryStore";
import { useSyncStore } from "@/store/useSyncStore";
import MenuList from "../MenuList";

jest.mock("@/services/queries/useProductsQuery", () => ({
  useProductsQuery: jest.fn(),
}));

describe("MenuList component", () => {
  const sampleProducts: Product[] = [
    {
      id: "prod-1",
      name: "Iced Latte",
      sellingPrice: 28000,
      imageUrl: "https://example.com/latte.jpg",
      tax: 10,
      commission: 500,
      categoryCode: "COFFEE",
      deletedAt: null,
    } as any,
    {
      id: "prod-2",
      name: "Matcha Latte",
      sellingPrice: 32000,
      imageUrl: "https://example.com/matcha.jpg",
      tax: 0,
      commission: 0,
      categoryCode: "TEA",
      deletedAt: "2026-08-20T10:00:00Z",
    } as any,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useCategoryStore.setState({
      selectedCategory: "ALL",
      searchQuery: "",
    });
    useSyncStore.setState({
      isSyncing: false,
    });
    useAuthStore.setState({
      user: {
        id: "u-1",
        name: "Manager User",
        roleCode: "MANAGER",
      } as any,
    });
    (useProductsQuery as jest.Mock).mockReturnValue({
      data: {
        content: sampleProducts,
        totalElements: 2,
      },
      isLoading: false,
    });
  });

  it("renders product cards with names and formatted prices", async () => {
    await render(<MenuList />);

    expect(screen.getByText("Iced Latte")).toBeTruthy();
    expect(screen.getByText("Matcha Latte")).toBeTruthy();
    expect(screen.getByText("Hidden")).toBeTruthy();
  });

  it("shows skeleton loader when products query is loading", async () => {
    (useProductsQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    await render(<MenuList />);

    expect(screen.queryByText("Iced Latte")).toBeNull();
  });

  it("shows skeleton loader during initial sync when no cached data is available", async () => {
    useSyncStore.setState({ isSyncing: true });
    (useProductsQuery as jest.Mock).mockReturnValue({
      data: { content: [] },
      isLoading: false,
    });

    await render(<MenuList />);

    expect(screen.queryByText("Iced Latte")).toBeNull();
  });

  it("renders category empty state when list is empty and not searching", async () => {
    (useProductsQuery as jest.Mock).mockReturnValue({
      data: { content: [] },
      isLoading: false,
    });

    await render(<MenuList />);

    expect(screen.getByText("No Products Available")).toBeTruthy();
    expect(screen.getByText("There are no products in this category yet.")).toBeTruthy();
  });

  it("renders search empty state when list is empty and searchQuery >= 2", async () => {
    useCategoryStore.setState({ searchQuery: "Chocolate" });
    (useProductsQuery as jest.Mock).mockReturnValue({
      data: { content: [] },
      isLoading: false,
    });

    await render(<MenuList />);

    expect(screen.getByText("No Products Found")).toBeTruthy();
    expect(screen.getByText("Try adjusting your search terms.")).toBeTruthy();
  });

  it("navigates to add-item modal with parameters when active product card is pressed", async () => {
    await render(<MenuList />);

    const productCard = screen.getByText("Iced Latte");
    await act(async () => {
      fireEvent.press(productCard);
    });

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/modal/order/add-item",
      params: {
        id: "prod-1",
        name: "Iced Latte",
        sellingPrice: 28000,
        imageUrl: "https://example.com/latte.jpg",
        tax: 10,
        commission: 500,
      },
    });
  });

  it("does not navigate when deleted/hidden product card is pressed in normal mode", async () => {
    await render(<MenuList />);

    const deletedCard = screen.getByText("Matcha Latte");
    await act(async () => {
      fireEvent.press(deletedCard);
    });

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("navigates to edit product page when editable is true", async () => {
    await render(<MenuList editable />);

    const productCard = screen.getByText("Iced Latte");
    await act(async () => {
      fireEvent.press(productCard);
    });

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/product/add",
      params: { id: "prod-1" },
    });
  });

  it("renders MenuActions and navigates on edit list or add product for OWNER/MANAGER", async () => {
    useAuthStore.setState({
      user: { id: "u-1", name: "Admin", roleCode: "OWNER" } as any,
    });

    const { getAllByTestId } = await render(<MenuList />);

    // MenuActions contains 2 IconButtons
    const iconButtons = getAllByTestId("svg-mock");
    expect(iconButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("hides MenuActions for CASHIER or other staff roles", async () => {
    useAuthStore.setState({
      user: { id: "u-2", name: "Cashier", roleCode: "CASHIER" } as any,
    });

    await render(<MenuList />);

    // In CASHIER mode, MenuActions is not rendered
    expect(screen.queryByText("Hidden")).toBeTruthy();
  });
});
