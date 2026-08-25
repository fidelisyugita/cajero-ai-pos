import { act, fireEvent, render, screen } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import type React from "react";
import useImageSelectionStore from "@/store/useImageSelectionStore";
import UploadImageModal from "../upload-image";

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
}));

describe("UploadImageModal integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useImageSelectionStore.setState({
      imageUri: undefined,
      onImageUploaded: jest.fn(),
    });
  });

  it("renders upload image modal and choose file button", async () => {
    await render(<UploadImageModal />);

    expect(screen.getAllByText("Upload Image").length).toBeGreaterThan(0);
    expect(screen.getByText("Choose File")).toBeTruthy();
    expect(screen.getByText("Choose Color")).toBeTruthy();
  });

  it("picks an image and saves the selection", async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///mock/image.png" }],
    });

    const mockCallback = jest.fn();
    useImageSelectionStore.setState({
      onImageUploaded: mockCallback,
    });

    await render(<UploadImageModal />);

    const chooseBtn = screen.getByText("Choose File");
    await act(async () => {
      fireEvent.press(chooseBtn);
    });

    expect(useImageSelectionStore.getState().imageUri).toBe(
      "file:///mock/image.png",
    );

    const saveBtn = screen.getByText("Save");
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(mockCallback).toHaveBeenCalledWith("file:///mock/image.png");
    expect(router.dismiss).toHaveBeenCalled();
  });
});
