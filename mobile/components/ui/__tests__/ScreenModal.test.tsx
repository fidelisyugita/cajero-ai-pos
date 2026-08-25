import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { mockRouter } from "@/jest.setup";
import ScreenModal from "../ScreenModal";

describe("ScreenModal component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal container, header, body, and footer properly", async () => {
    await render(
      <ScreenModal>
        <ScreenModal.Header title="Modal Title" />
        <ScreenModal.Body>
          <Text testID="modal-content">Body Content</Text>
        </ScreenModal.Body>
        <ScreenModal.Footer>
          <Text testID="modal-actions">Footer Actions</Text>
        </ScreenModal.Footer>
      </ScreenModal>,
    );

    expect(screen.getByText("Modal Title")).toBeTruthy();
    expect(screen.getByTestId("modal-content")).toBeTruthy();
    expect(screen.getByTestId("modal-actions")).toBeTruthy();
  });

  it("calls router.dismiss when close button in header is pressed", async () => {
    await render(
      <ScreenModal>
        <ScreenModal.Header title="Closeable Modal" />
      </ScreenModal>,
    );

    const closeBtn = screen.getByTestId("modal-close-button");
    await act(async () => {
      fireEvent.press(closeBtn);
    });

    expect(mockRouter.dismiss).toHaveBeenCalledTimes(1);
  });

  it("hides close button in header when hideCloseButton is true", async () => {
    await render(
      <ScreenModal>
        <ScreenModal.Header hideCloseButton title="No Close Button Modal" />
      </ScreenModal>,
    );

    expect(screen.queryByTestId("modal-close-button")).toBeNull();
    expect(screen.getByText("No Close Button Modal")).toBeTruthy();
  });

  it("calls router.dismiss when backdrop is pressed", async () => {
    await render(
      <ScreenModal>
        <Text>Inner content</Text>
      </ScreenModal>,
    );

    const backdrop = screen.getByTestId("modal-backdrop");
    await act(async () => {
      fireEvent.press(backdrop);
    });

    expect(mockRouter.dismiss).toHaveBeenCalledTimes(1);
  });
});
