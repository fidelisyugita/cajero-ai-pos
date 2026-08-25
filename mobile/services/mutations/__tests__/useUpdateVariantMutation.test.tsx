import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import api from "@/lib/axios";
import { useUpdateVariantMutation } from "../useUpdateVariantMutation";

jest.mock("@/lib/axios", () => ({
  __esModule: true,
  default: {
    put: jest.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useUpdateVariantMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("successfully updates variant and invalidates variants query", async () => {
    const updateData = {
      name: "Milk Type",
      description: "Dairy or Plant-based",
      isRequired: true,
      isMultiple: false,
      options: [
        {
          id: "opt-1",
          name: "Oat Milk",
          priceAdjusment: 7000,
          stock: 30,
        },
      ],
    };
    const mockResponse = { id: "var-123", ...updateData };
    (api.put as jest.Mock).mockResolvedValue({ data: mockResponse });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useUpdateVariantMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync({
        id: "var-123",
        data: updateData,
      });
    });

    expect(api.put).toHaveBeenCalledWith("/variant/var-123", updateData);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["variants"] });
    expect(mutationResult).toEqual(mockResponse);
  });

  it("propagates error when api.put fails", async () => {
    const mockError = new Error("Failed to update variant");
    (api.put as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useUpdateVariantMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          id: "var-999",
          data: {
            name: "Invalid",
            isRequired: false,
            isMultiple: false,
            options: [],
          },
        }),
      ).rejects.toEqual(mockError);
    });
  });
});
