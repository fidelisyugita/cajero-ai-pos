import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import type React from "react";
import { useCreateMeasureUnitMutation } from "@/services/mutations/useCreateMeasureUnitMutation";
import { useMeasureUnitsQuery } from "@/services/queries/useMeasureUnitsQuery";
import { useMeasureUnitStore } from "@/store/useMeasureUnitStore";
import SelectMeasureUnitModal from "../select-measure-unit";

jest.mock("@/services/queries/useMeasureUnitsQuery", () => ({
  useMeasureUnitsQuery: jest.fn(),
}));

jest.mock("@/services/mutations/useCreateMeasureUnitMutation", () => ({
  useCreateMeasureUnitMutation: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("SelectMeasureUnitModal integration", () => {
  const mockUnits = [
    { code: "PCS", name: "Pieces" },
    { code: "KG", name: "Kilogram" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useMeasureUnitStore.setState({
      selectedMeasureUnit: undefined,
      newMeasureUnitName: "",
      newMeasureUnitCode: "",
    });
    (useMeasureUnitsQuery as jest.Mock).mockReturnValue({
      data: mockUnits,
      isLoading: false,
    });
    (useCreateMeasureUnitMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  it("renders measure units list and selects a unit", async () => {
    await render(<SelectMeasureUnitModal />, { wrapper: createWrapper() });

    expect(screen.getByText("Select Measure Unit")).toBeTruthy();
    expect(screen.getByText("Add Measure Unit")).toBeTruthy();
    expect(screen.getByText("Pieces (PCS)")).toBeTruthy();
    expect(screen.getByText("Kilogram (KG)")).toBeTruthy();

    const pcsItem = screen.getByText("Pieces (PCS)");
    await act(async () => {
      fireEvent.press(pcsItem);
    });

    expect(useMeasureUnitStore.getState().selectedMeasureUnit?.code).toBe("PCS");

    const selectBtn = screen.getByText("Select");
    await act(async () => {
      fireEvent.press(selectBtn);
    });

    expect(router.dismiss).toHaveBeenCalled();
  });
});
