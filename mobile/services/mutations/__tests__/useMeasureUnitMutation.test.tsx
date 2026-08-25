import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { type CreateMeasureUnitRequest, postMeasureUnit } from "../../endpoints/postMeasureUnit";
import { useAddMeasureUnitMutation } from "../useMeasureUnitMutation";

jest.mock("../../endpoints/postMeasureUnit", () => ({
  postMeasureUnit: jest.fn(),
}));

describe("useMeasureUnitMutation (useAddMeasureUnitMutation wrapper)", () => {
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

  it("calls postMeasureUnit and returns created measure unit", async () => {
    const mockRequest: CreateMeasureUnitRequest = {
      code: "L",
      name: "Liter",
      description: "Liquid measure",
    };

    const mockResponse = {
      code: "L",
      name: "Liter",
      description: "Liquid measure",
      storeId: "store-1",
    };

    (postMeasureUnit as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = await renderHook(() => useAddMeasureUnitMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync(mockRequest);
    });

    expect(postMeasureUnit).toHaveBeenCalledWith(mockRequest);
    expect(mutationResult).toEqual(mockResponse);
  });

  it("propagates error when postMeasureUnit fails", async () => {
    const mockError = new Error("Failed to add measure unit");
    (postMeasureUnit as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useAddMeasureUnitMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          code: "GR",
          name: "Gram",
          description: "Weight unit in grams",
        }),
      ).rejects.toEqual(mockError);
    });
  });
});
