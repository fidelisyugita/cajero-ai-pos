import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { type CreateMeasureUnitRequest, postMeasureUnit } from "../../endpoints/postMeasureUnit";
import { useCreateMeasureUnitMutation } from "../useCreateMeasureUnitMutation";

jest.mock("../../endpoints/postMeasureUnit", () => ({
  postMeasureUnit: jest.fn(),
}));

describe("useCreateMeasureUnitMutation", () => {
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

  it("calls postMeasureUnit and invalidates measure-units query cache", async () => {
    const mockRequest: CreateMeasureUnitRequest = {
      code: "ML",
      name: "Milliliter",
      description: "Volume measurement in ml",
    };

    const mockResponse = {
      code: "ML",
      name: "Milliliter",
      description: "Volume measurement in ml",
      storeId: "store-123",
    };

    (postMeasureUnit as jest.Mock).mockResolvedValue(mockResponse);
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useCreateMeasureUnitMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync(mockRequest);
    });

    expect(postMeasureUnit).toHaveBeenCalledWith(mockRequest);
    expect(mutationResult).toEqual(mockResponse);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["measure-units"],
    });
  });

  it("propagates error when postMeasureUnit fails", async () => {
    const mockError = new Error("Measure unit already exists");
    (postMeasureUnit as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useCreateMeasureUnitMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          code: "KG",
          name: "Kilogram",
          description: "Weight unit in kg",
        }),
      ).rejects.toEqual(mockError);
    });
  });
});
