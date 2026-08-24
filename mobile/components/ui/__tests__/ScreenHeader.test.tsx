import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { mockRouter } from "@/jest.setup";
import ScreenHeader from "../ScreenHeader";

describe("ScreenHeader component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title correctly", async () => {
    await render(<ScreenHeader title="Dashboard Header" />);

    expect(screen.getByText("Dashboard Header")).toBeTruthy();
  });

  it("calls custom onBack callback when back button is pressed", async () => {
    const handleBack = jest.fn();
    await render(<ScreenHeader onBack={handleBack} title="Settings" />);

    const backButton = screen.getByTestId("header-back-button");
    await act(async () => {
      fireEvent.press(backButton);
    });

    expect(handleBack).toHaveBeenCalledTimes(1);
    expect(mockRouter.back).not.toHaveBeenCalled();
  });

  it("calls router.back when no custom onBack is provided", async () => {
    await render(<ScreenHeader title="Product Details" />);

    const backButton = screen.getByTestId("header-back-button");
    await act(async () => {
      fireEvent.press(backButton);
    });

    expect(mockRouter.canGoBack).toHaveBeenCalled();
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it("hides back button when noBack prop is true", async () => {
    await render(<ScreenHeader noBack title="Home Page" />);

    expect(screen.queryByTestId("header-back-button")).toBeNull();
    expect(screen.getByText("Home Page")).toBeTruthy();
  });

  it("renders rightAction node when provided", async () => {
    await render(
      <ScreenHeader rightAction={<Text testID="right-action-btn">Action</Text>} title="Orders" />,
    );

    expect(screen.getByTestId("right-action-btn")).toBeTruthy();
    expect(screen.getByText("Action")).toBeTruthy();
  });
});
