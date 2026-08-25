import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { getMeasureUnits } from "../../endpoints/getMeasureUnits";
import { useMeasureUnitsQuery } from "../useMeasureUnitsQuery";

jest.mock("../../endpoints/getMeasureUnits", () => ({
  getMeasureUnits: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useMeasureUnitsQuery", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("fetches measure units list successfully with queryKey ['measure-units']", async () => {
    const mockUnits = [
      { code: "GR", name: "Gram", description: "Weight in grams" },
      { code: "ML", name: "Milliliter", description: "Volume in ml" },
      { code: "PCS", name: "Pieces", description: "Single piece count" },
    ];

    (getMeasureUnits as jest.Mock).mockResolvedValue(mockUnits);

    const { result } = await renderHook(() => useMeasureUnitsQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getMeasureUnits).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockUnits);
  });

  it("handles error when getMeasureUnits fails", async () => {
    const mockError = new Error("Failed to load measure units");
    (getMeasureUnits as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useMeasureUnitsQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(mockError);
  });
});
