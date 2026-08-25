import { fireEvent, render, screen } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";
import type React from "react";
import { useUpdateStoreMutation } from "@/services/mutations/useUpdateStoreMutation";
import { useUploadImageMutation } from "@/services/mutations/useUploadImageMutation";
import UpdateStoreModal from "../update-store";

jest.mock("@/services/mutations/useUpdateStoreMutation", () => ({
  useUpdateStoreMutation: jest.fn(),
}));

jest.mock("@/services/mutations/useUploadImageMutation", () => ({
  useUploadImageMutation: jest.fn(),
}));

describe("UpdateStoreModal integration", () => {
  const sampleStore = {
    id: "store-1",
    name: "Cajero Cafe",
    phone: "+628111222333",
    email: "contact@cajero.com",
    description: "Specialty coffee shop",
    imageUrl: "https://cajero.com/logo.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      storeData: JSON.stringify(sampleStore),
    });
    (useUpdateStoreMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
    (useUploadImageMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
  });

  it("pre-fills form with store data and renders modal fields", async () => {
    await render(<UpdateStoreModal />);

    expect(screen.getByText("Edit Business Profile")).toBeTruthy();
    expect(screen.getByDisplayValue("Cajero Cafe")).toBeTruthy();
    expect(screen.getByDisplayValue("+628111222333")).toBeTruthy();
    expect(screen.getByDisplayValue("contact@cajero.com")).toBeTruthy();
    expect(screen.getByDisplayValue("Specialty coffee shop")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("navigates back on Cancel button press", async () => {
    await render(<UpdateStoreModal />);

    const cancelBtn = screen.getByText("Cancel");
    fireEvent.press(cancelBtn);

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
