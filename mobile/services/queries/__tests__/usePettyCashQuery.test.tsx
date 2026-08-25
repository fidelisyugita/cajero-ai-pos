import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { getPettyCash } from "../../endpoints/getPettyCash";
import { usePettyCashQuery } from "../usePettyCashQuery";

jest.mock("../../endpoints/getPettyCash", () => ({
  getPettyCash: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("usePettyCashQuery", () => {
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

  it("fetches petty cash list with default empty parameters", async () => {
    const mockResponse = {
      content: [
        {
          id: "pc-1",
          amount: 100000,
          type: "IN",
          description: "Opening float",
          createdAt: "2026-08-01T08:00:00Z",
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
    };

    (getPettyCash as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = await renderHook(() => usePettyCashQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getPettyCash).toHaveBeenCalledWith({});
    expect(result.current.data).toEqual(mockResponse);
  });

  it("fetches petty cash list with provided filter parameters", async () => {
    const mockResponse = {
      content: [
        {
          id: "pc-2",
          amount: 25000,
          type: "OUT",
          description: "Cleaning supplies",
          createdAt: "2026-08-10T10:00:00Z",
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 20,
      number: 0,
    };

    (getPettyCash as jest.Mock).mockResolvedValue(mockResponse);

    const params = {
      startDate: "2026-08-01",
      endDate: "2026-08-15",
      keyword: "clean",
      page: 0,
      size: 20,
    };

    const { result } = await renderHook(() => usePettyCashQuery(params), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getPettyCash).toHaveBeenCalledWith(params);
    expect(result.current.data).toEqual(mockResponse);
  });

  it("handles error when getPettyCash fails", async () => {
    const mockError = new Error("Network error fetching petty cash");
    (getPettyCash as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => usePettyCashQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(mockError);
  });
});
