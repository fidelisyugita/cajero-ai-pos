import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import type React from "react";
import { useIngredientsQuery } from "@/services/queries/useIngredientsQuery";
import { useVariantStore } from "@/store/useVariantStore";
import EditVariantModal from "../edit-variant";

jest.mock("@/services/queries/useIngredientsQuery", () => ({
  useIngredientsQuery: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("EditVariantModal integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useVariantStore.setState({
      selectedVariant: undefined,
      variants: [],
    });
    (useIngredientsQuery as jest.Mock).mockReturnValue({
      data: [{ id: "ing-1", name: "Sugar" }],
      isLoading: false,
    });
  });

  it("renders variant details form and options section", async () => {
    await render(<EditVariantModal />, { wrapper: createWrapper() });

    expect(screen.getByText("Add Variant")).toBeTruthy();
    expect(screen.getByText(/Variant Details/i)).toBeTruthy();
    expect(screen.getByText("Variant Name")).toBeTruthy();
    expect(screen.getByText("Required")).toBeTruthy();
    expect(screen.getByText(/Options/i)).toBeTruthy();
    expect(screen.getByText("Option 1")).toBeTruthy();
  });

  it("adds variant draft when form is submitted with option name", async () => {
    await render(<EditVariantModal />, { wrapper: createWrapper() });

    const nameInput = screen.getByPlaceholderText("e.g. Size");
    const optionNameInput = screen.getByPlaceholderText("Name");

    await act(async () => {
      fireEvent.changeText(nameInput, "Size");
      fireEvent.changeText(optionNameInput, "Regular");
    });

    const saveBtn = screen.getByText("Save");
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(
      useVariantStore.getState().variants.some((v) => v.name === "Size"),
    ).toBe(true);
    expect(router.back).toHaveBeenCalled();
  });
});
