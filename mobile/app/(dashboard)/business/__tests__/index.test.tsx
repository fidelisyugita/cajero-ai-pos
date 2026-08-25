import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react-native";
import type React from "react";
import { useStoreQuery } from "@/services/queries/useStoreQuery";
import { useUsersQuery } from "@/services/queries/useUsersQuery";
import { useAuthStore } from "@/store/useAuthStore";
import BusinessScreen from "../index";

jest.mock("@/services/queries/useStoreQuery", () => ({
  useStoreQuery: jest.fn(),
}));

jest.mock("@/services/queries/useUsersQuery", () => ({
  useUsersQuery: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("BusinessScreen integration", () => {
  const mockStore = {
    id: "store-1",
    name: "Cajero Headquarters",
    phone: "+628111222333",
    email: "hq@cajero.com",
    description: "Flagship cafe and roastery",
    location: {
      street: "Jl. Sudirman 10",
      city: "Jakarta",
      country: "Indonesia",
      postalCode: "12190",
    },
  };

  const mockUsers = [
    {
      id: "u-owner",
      name: "Owner John",
      email: "owner@cajero.com",
      roleCode: "OWNER",
    },
    {
      id: "u-staff",
      name: "Staff Jane",
      email: "jane@cajero.com",
      roleCode: "CASHIER",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: "u-owner",
        name: "Owner John",
        email: "owner@cajero.com",
        roleCode: "OWNER",
        storeId: "store-1",
      } as any,
    });
    (useStoreQuery as jest.Mock).mockReturnValue({
      data: mockStore,
      isLoading: false,
    });
    (useUsersQuery as jest.Mock).mockReturnValue({
      data: mockUsers,
      isLoading: false,
    });
  });

  it("renders business profile, owner info, and employee list cards", async () => {
    await render(<BusinessScreen />, { wrapper: createWrapper() });

    expect(screen.getByText("Business Info")).toBeTruthy();
    expect(screen.getByText("Cajero Headquarters")).toBeTruthy();
    expect(screen.getAllByText("Owner John").length).toBeGreaterThan(0);
    expect(screen.getByText("Staff Jane")).toBeTruthy();
    expect(screen.getByText("jane@cajero.com")).toBeTruthy();
  });
});
