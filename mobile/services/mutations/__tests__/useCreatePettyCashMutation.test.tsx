import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { type CreatePettyCashRequest, createPettyCash } from "../../endpoints/createPettyCash";
import { useCreatePettyCashMutation } from "../useCreatePettyCashMutation";

jest.mock("../../endpoints/createPettyCash", () => ({
  createPettyCash: jest.fn(),
}));

describe("useCreatePettyCashMutation", () => {
  let queryClient: QueryClient;

  const createWrapper = (client: QueryClient) => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it("calls createPettyCash and invalidates petty-cash query cache", async () => {
    const mockRequest: CreatePettyCashRequest = {
      amount: 50000,
      description: "Office supplies",
      isIncome: false,
    };

    const mockResponse = {
      id: "pc-123",
      amount: 50000,
      description: "Office supplies",
      isIncome: false,
      storeId: "store-1",
      createdAt: "2026-03-01T10:00:00.000Z",
      updatedAt: "2026-03-01T10:00:00.000Z",
    };

    (createPettyCash as jest.Mock).mockResolvedValue(mockResponse);
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useCreatePettyCashMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync(mockRequest);
    });

    expect(createPettyCash).toHaveBeenCalledWith(mockRequest);
    expect(mutationResult).toEqual(mockResponse);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["petty-cash"],
    });
  });

  it("propagates error when createPettyCash fails", async () => {
    const mockError = new Error("Failed to create petty cash entry");
    (createPettyCash as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useCreatePettyCashMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          amount: 25000,
          description: "Snacks",
          isIncome: false,
        }),
      ).rejects.toEqual(mockError);
    });
  });
});
