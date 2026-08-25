import { fireEvent, render, screen } from "@testing-library/react-native";
import OwnerInfoCard from "../OwnerInfoCard";

describe("OwnerInfoCard component", () => {
  const defaultProps = {
    name: "Bruce Wayne",
    role: "Owner",
    email: "bruce@wayneenterprises.com",
    avatar: "https://cajero.com/bruce.jpg",
    loading: false,
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders owner details when not loading", async () => {
    await render(<OwnerInfoCard {...defaultProps} />);

    expect(screen.getByText("Bruce Wayne")).toBeTruthy();
    expect(screen.getByText("Owner")).toBeTruthy();
    expect(screen.getByText("bruce@wayneenterprises.com")).toBeTruthy();
  });

  it("invokes onEdit when edit icon button is pressed", async () => {
    await render(<OwnerInfoCard {...defaultProps} />);

    const svgIcon = screen.getByTestId("svg-mock");
    fireEvent.press(svgIcon);

    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it("renders skeleton placeholders when loading is true", async () => {
    await render(<OwnerInfoCard {...defaultProps} loading={true} />);

    expect(screen.queryByText("Bruce Wayne")).toBeNull();
    expect(screen.queryByText("Owner")).toBeNull();
  });
});
